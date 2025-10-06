// api/abouts.js
const express = require('express');
const router = express.Router();

// 引入 Model 文件
const Users = require('../config/db.js');
const About = require('../config/db.js');

export default async function handler(req, res) {
  // 設定 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const method = req.method;

    if (method === 'GET') {
      // 查詢所有 Abouts
      const getAbout = await About.client.query(`SELECT * FROM "Abouts"`);
      if (!getAbout.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到伺服器資料" });
      }
      const getAbouts = getAbout.rows.map(row => ({
        text: row.text,
        linkRel: row.linkRel,
        linkHref: row.linkHref,
        linkAction: row.linkAction
      }));
      return res.status(200).json({ status: 200, data: { getAbouts } });
    }

    if (method === 'POST') {
      const createAbout = {
        text: req.body.text,
        linkRel: req.body.linkRel,
        linkHref: req.body.linkHref,
        linkAction: req.body.linkAction
      };

      const aboutFind = await About.client.query(`SELECT * FROM "Abouts" WHERE text = $1`, [createAbout.text]);

      if (aboutFind.text === 0) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (createAbout !== "") {
        return res.status(401).json({ status: 401, error: "操作失敗：格式不正確" });
      }

      const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [req.body.roles]);
      if (req.body.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您沒有權限進行此操作！" });
      }

      await About.client.query(
        `INSERT INTO "Abouts" ("text", "linkRel", "linkHref", "linkAction", "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,$5,$6)`,
        [createAbout.text, createAbout.linkRel, createAbout.linkHref, createAbout.linkAction, new Date(), new Date()]
      );

      return res.status(200).json({ status: 200, data: { createAbout } });
    }

    if (method === 'PUT') {
      const BeforeupdatAbout = { roles: req.query.roles };
      const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [BeforeupdatAbout.roles]);
      if (findUser.roles !== 1 && BeforeupdatAbout.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      const updateAbout = {
        id: req.body.id,
        text: req.body.text,
        linkRel: req.body.linkRel,
        linkHref: req.body.linkHref,
        linkAction: req.body.linkAction
      };
      if (updateAbout !== "") {
        return res.status(404).json({ status: 404, error: "操作失敗：格式不正確" });
      }

      await About.client.query(
        `UPDATE "Abouts" SET "text"=$1, "linkRel"=$2, "linkHref"=$3, "linkAction"=$4, "createdAt"=$5, "updatedAt"=$6 WHERE "id"=$7`,
        [updateAbout.text, updateAbout.linkRel, updateAbout.linkHref, updateAbout.linkAction, updateAbout.id, new Date(), new Date()]
      );

      const aboutsExists = await About.client.query(`SELECT * FROM "Abouts" WHERE id = $1`, [BeforeupdatAbout.id]);
      if (!aboutsExists.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到此項目" });
      }

      return res.status(200).json({ status: 200, data: { updateAbout } });
    }

    if (method === 'DELETE') {
      const deleteAbout = { id: req.body.id, roles: req.body.roles };
      const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [deleteAbout.roles]);

      if (!findUser.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (deleteAbout.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      const afterDeleted = await About.client.query(`DELETE FROM "Abouts" WHERE id = $1`, [deleteAbout.id]);
      if (!afterDeleted.id) {
        return res.status(404).json({ status: 404, error: "此項目已經遭刪除" });
      }

      return res.status(200).json({ status: 200, data: { id: deleteAbout.id } });
    }

    return res.status(405).json({ status: 405, error: "不支援的 HTTP 方法" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error: "內部伺服器錯誤" });
  }
}
