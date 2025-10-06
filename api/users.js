// api/users.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { client as UsersClient } from '../config/db.js';

export default async function handler(req, res) {
  // CORS 設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const method = req.method;

    if (method === 'POST' && req.url === '/Login') {
      const loginInput = { username: req.body.username, password: req.body.password };

      if (!loginInput.username || !loginInput.password) {
        return res.status(401).json({ status: 401, error: "操作失敗：請輸入帳號和密碼" });
      }

      const findUserPwd = await UsersClient.query(`SELECT * FROM "Users" WHERE username=$1`, [loginInput.username]);

      if (!findUserPwd.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：使用者未找到" });
      }

      const comparePwd = await bcrypt.compare(loginInput.password, findUserPwd.rows[0].password);
      if (!comparePwd) {
        return res.status(401).json({ status: 401, error: "操作失敗：帳號或密碼錯誤！" });
      }

      const token = jwt.sign({ id: findUserPwd.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      return res.status(200).json({
        status: 200,
        data: { username: loginInput.username },
        Token: token
      });
    }

    if (method === 'GET') {
      const usersRole = { roles: req.body.roles };
      const userFind = await UsersClient.query(`SELECT * FROM "Users" WHERE roles=$1`, [usersRole.roles]);

      if (!userFind.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (usersRole.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您沒有權限進行此操作！" });
      }

      const getUserAllAct = userFind.rows.map(user => ({
        username: user.username,
        password: user.password,
        roles: user.roles
      }));

      return res.status(200).json({ status: 200, data: { getUserAllAct } });
    }

    if (method === 'POST') {
      const createUser = {
        username: req.body.username,
        password: req.body.password,
        roles: req.body.roles
      };

      if (createUser.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      if (!createUser.username || !createUser.password) {
        return res.status(401).json({ status: 401, error: "操作失敗：帳號格式不正確！" });
      }

      const hashedPassword = await bcrypt.hash(createUser.password, 10);
      await UsersClient.query(
        `INSERT INTO "Users" ("username","password","roles","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5)`,
        [createUser.username, hashedPassword, createUser.roles, new Date(), new Date()]
      );

      return res.status(200).json({
        status: 200,
        data: { username: createUser.username, password: hashedPassword, roles: createUser.roles }
      });
    }

    if (method === 'DELETE') {
      const deleteInput = { id: req.body.id, roles: req.body.roles };

      const findUserAct = await UsersClient.query(`SELECT * FROM "Users" WHERE id=$1`, [deleteInput.id]);
      if (!findUserAct.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (deleteInput.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      await UsersClient.query(`DELETE FROM "Users" WHERE id=$1`, [deleteInput.id]);
      return res.status(200).json({ status: 200, message: "帳號已刪除" });
    }

    return res.status(405).json({ status: 405, error: "不支援的 HTTP 方法" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error: "內部伺服器錯誤" });
  }
}