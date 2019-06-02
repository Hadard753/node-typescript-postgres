import * as createError from 'http-errors';
import * as request from "request-promise-native";

import * as responses from '../responses';
import Stock from '../../db-models/stock';
import { UserProfile } from '../../../shared/models';
import Vote from '../../db-models/vote';
import Cacher from '../cacher';

class StockController {
    async all() {
        return Stock.findAll({include: [Vote]}).then((stocks: Stock[]) => {
            return responses.getOkayResponse(stocks);
        }).catch((err) => {
            throw createError(500, `An error has ocurred please try again later.`);
        });
    }

    async getById(id: number) {
        return Stock.findOne({where: {id: id}, include: [Vote]}).then(stock => {
            if(!stock)
                return Promise.reject(createError(400, `Stock does not exit`));
            return responses.getOkayResponse(stock);
        }).catch((err) => {
            throw createError(500, `An error has ocurred please try again later.`);
        });
    }

    async addStock(name: string, symbol: string) {
        // TODO : query price from external api
        return Stock.create({name: name, price: 20, symbol: symbol}).then(stock => {
            Cacher.addStock(stock);
            return responses.getOkayResponse(stock);
        }).catch((err) => {
            throw createError(500, `An error has ocurred please try again later.`);
        });
    }

    async vote(stockId: number, buy: boolean, user: UserProfile) {
        return Stock.findOne({where: {id: stockId}, include: [Vote]}).then((stock) => {
            if(!stock)
                return responses.getErrorResponse(createError(400, `Stock not found.`));
            let today = new Date();
            today.setHours(0,0,0,0); 
            let myDailyVotes = stock.votes.filter(v => {
                return v.userId == user.id && v.createdAt > today;
            }); 
            if(myDailyVotes.length > 0) 
                return responses.getErrorResponse(createError(400, `You already voted for that stock today.`));
            return Vote.create({buy: buy, userId: user.id, stockId: stockId}).then(vote => {
                Cacher.voteForStock(vote, stock.symbol);
                return responses.getOkayResponse(vote); 
            });
        }).catch((err) => { 
            throw createError(500, `An error has ocurred please try again later.`);
        });
    }

    async getCache() {
        return Cacher.getCacheAsArr().then(cache => {
            return responses.getOkayResponse(cache);
        }).catch(err => {
            throw createError(500, `An error has ocurred please try again later.`);
        });
    }

    async initStockDB() {
        const url = 'https://cloud.iexapis.com/beta/ref-data/symbols/?token=sk_20dca59d80c2408d8d32a2287858ad07';
        
        return request.get(url, {json: true}, (err, res, body) => {
            for (let stock of body) {
                Stock.create({name: stock.name, symbol: stock.symbol, price: 0});
            }
        });
    }
}

export default new StockController();
