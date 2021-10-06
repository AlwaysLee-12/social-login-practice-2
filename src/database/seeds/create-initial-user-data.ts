import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';
import { User } from '../../entities/user.entity';

export class CreateInitialUserData implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await connection
      .createQueryBuilder()
      .insert()
      .into(User)
      .values([
        { id: 1, nick_name: '깨꺠오', provider: 'Kakao' },
        { id: 2, nick_name: '애뽀', provider: 'Apple' },
        { id: 3, nick_name: '해윙', provider: 'Kakao' },
        { id: 4, nick_name: '배윙', provider: 'Apple' },
      ])
      .execute();
  }
}
