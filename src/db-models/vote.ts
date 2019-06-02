import {Table, Column, Model, ForeignKey, DataType, BelongsTo} from 'sequelize-typescript';
import User from './user';
import Stock from "./stock";

@Table({
  freezeTableName: true
})
class Vote extends Model<Vote> {
  @Column(DataType.BOOLEAN)
  buy: boolean;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER)
  userId: number;
 
  @ForeignKey(() => Stock)
  @Column(DataType.STRING)
  stockId: string;

  @BelongsTo(() => Stock)
  stock: Stock;
}

export default Vote;
