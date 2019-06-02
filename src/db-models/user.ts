import { Model,Table,Column, DataType } from "sequelize-typescript";

@Table({
    freezeTableName: true
})
class User extends Model<User> {
    @Column(DataType.STRING)
    email: string;
    @Column(DataType.STRING)
    password: string;
}

export default User;