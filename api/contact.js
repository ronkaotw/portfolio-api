// api/contacts.js
const Users = require('../config/db.js');
const Contact = require('../config/db.js');

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const method = req.method;

    if (method === 'GET') {
      const getContact = await Contact.client.query(`SELECT * FROM "Contacts"`);
      if (!getContact.rows.length) {
        return res.status(404).json({ status: 404, error: "操作錯誤：找不到伺服器資料" });
      }
      const getContacts = getContact.rows.map(row => ({
        text: row.text,
        linkRel: row.linkRel,
        linkHref: row.linkHref,
        linkAction: row.linkAction
      }));
      return res.status(200).json({ status: 200, data: { getContacts } });
    }

    if (method === 'POST') {
      const createContact = {
        text: req.body.text,
        linkRel: req.body.linkRel,
        linkHref: req.body.linkHref,
        linkAction: req.body.linkAction
      };

      const contactFind = await Contact.client.query(`SELECT * FROM "Contacts" WHERE text = $1`, [createContact.text]);

      if (createContact === 0) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (createContact === "") {
        return res.status(401).json({ status: 401, error: "操作失敗：格式不正確" });
      }

      const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [req.body.roles]);
      if (req.body.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您沒有權限進行此操作" });
      }

      await Contact.client.query(
        `INSERT INTO "Contacts" ("text", "linkRel", "linkHref","linkAction","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6)`,
        [createContact.text, createContact.linkRel, createContact.linkHref, createContact.linkAction, new Date(), new Date()]
      );

      return res.status(200).json({ status: 200, data: { createContact } });
    }

    if (method === 'PUT') {
      const BeforeUpdatedContact = { roles: req.query.roles };
      const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [BeforeUpdatedContact.roles]);

      if (userFind.roles !== 1 && BeforeUpdatedContact.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      const updateContact = {
        id: req.body.id,
        text: req.body.text,
        linkRel: req.body.linkRel,
        linkHref: req.body.linkHref,
        linkAction: req.body.linkAction
      };

      if (updateContact === "") {
        return res.status(404).json({ status: 404, error: "操作失敗：格式不正確" });
      }

      await Contact.client.query(
        `UPDATE "Contacts" SET "text"=$1, "linkRel"=$2, "linkHref"=$3, "linkAction"=$4, "createdAt"=$5, "updatedAt"=$6 WHERE "id"=$7`,
        [updateContact.text, updateContact.linkRel, updateContact.linkHref, updateContact.linkAction, new Date(), new Date(), updateContact.id]
      );

      const contactExists = await Contact.client.query(`SELECT * FROM "Contacts" WHERE id = $1`, [req.body.id]);
      if (!contactExists.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到此項目" });
      }

      return res.status(200).json({ status: 200, data: { updateContact } });
    }

    if (method === 'DELETE') {
      const deleteContact = { id: req.body.id, roles: req.body.roles };
      const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [deleteContact.roles]);

      if (!findUser.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (deleteContact.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      const afterDeleted = await Contact.client.query(`DELETE FROM "Contacts" WHERE id = $1`, [deleteContact.id]);
      if (!afterDeleted.id) {
        return res.status(404).json({ status: 404, error: "此項目已經遭刪除" });
      }

      return res.status(200).json({ status: 200, data: { id: deleteContact.id } });
    }

    return res.status(405).json({ status: 405, error: "不支援的 HTTP 方法" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error: "內部伺服器錯誤" });
  }
}
