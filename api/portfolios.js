// api/portfolios.js
const Users = require('../config/db.js');
const Portfolio = require('../config/db.js');

export default async function handler(req, res) {
  // CORS 設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const method = req.method;

    if (method === 'GET') {
      const getPortfolio = await Portfolio.client.query(`SELECT * FROM "Portfolios"`);
      if (!getPortfolio.rows.length) {
        return res.status(404).json({ status: 404, error: "操作錯誤：找不到伺服器資料" });
      }
      const getPortfolios = getPortfolio.rows.map(row => ({
        title: row.title,
        years: row.years,
        role: row.role,
        item: row.item,
        linkRel: row.linkRel,
        linkHref: row.linkHref,
        linkAction: row.linkAction
      }));
      return res.status(200).json({ status: 200, data: { getPortfolios } });
    }

    if (method === 'POST') {
      const createPortfolio = {
        roles: req.body.roles,
        title: req.body.title,
        years: req.body.years,
        role: req.body.role,
        item: req.body.item,
        linkRel: req.body.linkRel,
        linkHref: req.body.linkHref,
        linkAction: req.body.linkAction
      };

      const portfolioFind = await Portfolio.client.query(
        `SELECT * FROM "Portfolios" WHERE title = $1`, 
        [createPortfolio.title]
      );

      if (portfolioFind === 0) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到資料" });
      }

      if (createPortfolio === "") {
        return res.status(401).json({ status: 401, error: "操作失敗：格式不正確" });
      }

      const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [req.body.roles]);
      if (req.body.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您沒有權限進行此操作" });
      }

      await Portfolio.client.query(
        `INSERT INTO "Portfolios" ("title","years","role","item","linkRel","linkHref","linkAction","createdAt","updatedAt") VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [createPortfolio.title, createPortfolio.years, createPortfolio.role, createPortfolio.item, createPortfolio.linkRel, createPortfolio.linkHref, createPortfolio.linkAction, new Date(), new Date()]
      );

      return res.status(200).json({ status: 200, data: { createPortfolio } });
    }

    if (method === 'PUT') {
      const BeforeUpdatedPort = { roles: req.query.roles };
      const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [BeforeUpdatedPort.roles]);

      if (findUser.roles !== 1 && BeforeUpdatedPort.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      const updatePortfolio = {
        id: req.body.id,
        roles: BeforeUpdatedPort.roles,
        title: req.body.title,
        years: req.body.years,
        role: req.body.role,
        item: req.body.item,
        linkRel: req.body.linkRel,
        linkHref: req.body.linkHref,
        linkAction: req.body.linkAction
      };

      if (!updatePortfolio === "") {
        return res.status(404).json({ status: 404, error: "操作失敗：格式不正確" });
      }

      await Portfolio.client.query(
        `UPDATE "Portfolios" SET "title"=$1,"years"=$2,"role"=$3,"item"=$4,"linkRel"=$5,"linkHref"=$6,"linkAction"=$7,"createdAt"=$8,"updatedAt"=$9 WHERE "id"=$10`,
        [updatePortfolio.title, updatePortfolio.years, updatePortfolio.role, updatePortfolio.item, updatePortfolio.linkRel, updatePortfolio.linkHref, updatePortfolio.linkAction, new Date(), new Date(), updatePortfolio.id]
      );

      const portfolioExists = await Portfolio.client.query(`SELECT * FROM "Portfolios" WHERE id=$1`, [req.body.id]);
      if (!portfolioExists.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：找不到此項目" });
      }

      return res.status(200).json({ status: 200, data: { updatePortfolio } });
    }

    if (method === 'DELETE') {
      const deletePort = { id: req.body.id, roles: req.body.roles };
      const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles=$1`, [deletePort.roles]);

      if (!userFind.rows.length) {
        return res.status(404).json({ status: 404, error: "操作失敗：您的權限不足！" });
      }

      if (deletePort.roles !== 1) {
        return res.status(401).json({ status: 401, error: "操作失敗：您的權限不足！" });
      }

      const afterDeleted = await Portfolio.client.query(`DELETE FROM "Portfolios" WHERE id=$1`, [deletePort.id]);
      if (!afterDeleted.id) {
        return res.status(404).json({ status: 404, error: "此項目已經遭刪除" });
      }

      return res.status(200).json({ status: 200, data: { id: deletePort.id } });
    }

    return res.status(405).json({ status: 405, error: "不支援的 HTTP 方法" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 500, error: "內部伺服器錯誤" });
  }
}
