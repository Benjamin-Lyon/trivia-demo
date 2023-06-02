import { db } from "../../schema";


export default async function Cart({
  params,
}: {
  params: { user: string };
}): Promise<JSX.Element> {
    const users = await db.selectFrom('users').selectAll().execute();

  return (
    <div>
      {users.map((row) => (
        <div key={row.id}>
          {row.id} - {row.email} - {row.wins}
        </div>
      ))}
    </div>
  );
}
