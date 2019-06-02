import { CacheEntry, Cache, VoteAVG } from "../../shared/models/chache";
import controller from "./stock/controller";
import Stock from "../db-models/stock";
import Vote from "../db-models/vote";
import socialtradingApp from '../index';
import * as request from "request-promise-native";

export class Cacher {
  private stocks: Cache = {};

  addStock(stock: Stock) {
    let price = 0;
    let initVote = { buy: 0, sell: 0, avg: 0};

    this.stocks[stock.symbol] = {
      id: stock.id,
      price,
      symbol: stock.symbol,
      name: stock.name,
      today: initVote,
      month: initVote,
      year: initVote
    };

    socialtradingApp.io.emit('stockAdded', this.stocks[stock.symbol]);
  }

  voteForStock(vote: Vote, stockSymbol: string) {
    let stock = this.stocks[stockSymbol];

    if (stock) {
      if (vote.buy) {
        stock.today.buy++;
        stock.month.buy++;
        stock.year.buy++;
      } else {
        stock.today.sell++; 
        stock.month.sell++; 
        stock.year.sell++;
      }
      
      stock.today.avg = this.calculateAVG(stock.today.buy, stock.today.sell);
      stock.month.avg = this.calculateAVG(stock.month.buy, stock.month.sell);
      stock.year.avg = this.calculateAVG(stock.year.buy, stock.year.sell);

      this.stocks[stockSymbol] = stock;
      socialtradingApp.io.emit('vote', stock);
    }
    else {
      throw Error(`The specified stock does not exist!`);
    }
  }

  getStock(stockSymbol: string): CacheEntry {
    return this.stocks[stockSymbol];
  }

  getCache(): Promise<Cache> {
    if (Object.keys(this.stocks).length) {
      return Promise.resolve(this.stocks);
    }
    return this.initCache();
  }

  getCacheAsArr(): Promise<CacheEntry[]> {
    if (Object.keys(this.stocks).length)
      return this.mapCacheToArr();
    return this.initCache().then(value => {
      return this.mapCacheToArr();
    });
  }

  mapCacheToArr(): Promise<CacheEntry[]> {
    let arr = [];
    if (Object.keys(this.stocks).length) {
      for(let key of Object.keys(this.stocks)) {
        arr.push(this.stocks[key]);
      }
    }
    return Promise.resolve(arr);
  }

  initCache(): Promise<Cache> {
    // this.fetchPriceService();
    return controller.all().then((result) => {
      let stocks: Stock[] = result.data;
      // TODO: Fetch stock price from trading view
      let price = 0;
      for (let s of stocks) {
        let avg = this.calculateVoteAVG(s.votes);
        this.stocks[s.symbol] = {
          id: s.id,
          price: s.price,
          symbol: s.symbol,
          name: s.name,
          today: avg.today,
          month: avg.month,
          year: avg.year
        };
      };
      this.fetchPriceService();
      setInterval(this.fetchPriceService, 20000);

      return this.stocks;
    });
  }

  updatePrice(stockSymbol: string, price: number) {
    this.stocks[stockSymbol].price = price;
  }

  private calculateAVG(buy: number, sell: number): number {
    if(buy+sell != 0) 
      return (buy/(buy+sell)) * 100;
    return 0;
  }

  private calculateVoteAVG(votes: Vote[]): {today: VoteAVG, month: VoteAVG, year: VoteAVG} {
    let today = {
      date: new Date(),
      buy: 0,
      sell: 0,
      avg: 0
    };
    today.date.setHours(0, 0, 0, 0); 
    let month = {
      date: new Date(today.date.getFullYear(), today.date.getMonth(), 1),
      buy: 0,
      sell: 0,
      avg: 0
    };
    let year = {
      date: new Date(today.date.getFullYear(), 0, 1),
      buy: 0,
      sell: 0,
      avg: 0
    };

    votes.forEach(v => {
      if (v.createdAt >= today.date) {
        if(v.buy) {
          today.buy++;
          month.buy++;
          year.buy++;
        } else {
          today.sell++;
          month.sell++;
          year.sell++;
        }
      } else if (v.createdAt >= month.date) {
        if(v.buy) {
          month.buy++;
          year.buy++;
        } else {
          month.sell++;
          year.sell++;
        }
      } else if (v.createdAt >= year.date) {
        if(v.buy) {
          year.buy++;
        } else {
          year.sell++;
        }
      }
    });

    today.avg = this.calculateAVG(today.buy, today.sell);
    month.avg = this.calculateAVG(month.buy, month.sell);
    year.avg = this.calculateAVG(year.buy, year.sell);

    return {today: today as VoteAVG, month: month as VoteAVG, year: year as VoteAVG};
  }

  private fetchPriceService() {
    if(this.stocks) {
      let url = 'https://api.iextrading.com/1.0/stock/market/batch?symbols=';
    
      for (let key of Object.keys(this.stocks)) {
        url += this.stocks[key].symbol+',';
      };
      
      url += '&types=price';
      
      request.get(url, {json: true}, (err, res, body) => {
          for (let key of Object.keys(this.stocks)) {
            this.stocks[key].price = body[key].price;
          };    
          socialtradingApp.io.emit('price', this.getCacheAsArr());
      });
    }
  }

}

export default new Cacher();
