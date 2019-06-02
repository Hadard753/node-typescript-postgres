import {Table, Column, Model, DataType, HasMany, Unique} from 'sequelize-typescript';
import Vote from './vote';

@Table({
    freezeTableName: true
})
class Stock extends Model<Stock> {
    @Unique
    @Column(DataType.STRING)
    name: string;
    @Unique
    @Column(DataType.STRING)
    symbol: string;
    @Column(DataType.FLOAT)
    price: number;
    
    @HasMany(() => Vote)
    votes: Vote[];
}

export default Stock;
