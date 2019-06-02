import { Model,Table,Column, DataType, HasMany } from "sequelize-typescript";
import Vote from "./vote";

@Table({
    freezeTableName: true
})
class User extends Model<User> {
    @Column(DataType.STRING)
    email: string;
    @Column(DataType.STRING)
    password: string;

    @HasMany(() => Vote)
    votes: Vote[];
}

export default User;