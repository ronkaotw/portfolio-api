const express = require('express');
const router = express.Router();

// 引入 Model 文件
const Users = require('../../config/db.js')
const Portfolio = require('../../config/db.js')

router.get ('/', async (req,res) => {
    try {
        // 查看所有作品集
        const getPortfolio = await Portfolio.client.query(`SELECT * FROM "Portfolios"`)

        if(getPortfolio.rows.length <= 0){
            return res.status(404).json({
                status: 404,
                error: "操作錯誤：找不到伺服器資料"
            }); 
        }else{
            const getPortfolios = getPortfolio.rows.map(row => ({
                title: row.title,
                years: row.years,
                role: row.role,
                item: row.item,
                linkRel: row.linkRel,
                linkHref: row.linkHref,
                linkAction: row.linkAction
            }))
         

            return res.status(200).json({
                status: 200,
                data:{
                    getPortfolios
                }
            })   
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });   
    }
})
// 需要權限才可進行操作
router.post ('/', async (req,res) => {
    try {
        const createPortfolio = {
            roles: req.body.roles,
            title: req.body.title,
            years: req.body.years,
            role: req.body.role,
            item: req.body.item,
            linkRel: req.body.linkRel,
            linkHref: req.body.linkHref,
            linkAction: req.body.linkAction
        }

        const portfolioFind = await Portfolio.client.query(`SELECT * FROM "Portfolios" WHERE title = $1`,[createPortfolio.title])

        // 找不到伺服器資料
        if(portfolioFind === 0){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料"
            }); 
        }

        // 判斷創建作品集格
        if(createPortfolio === ""){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：格式不正確"
            }); 
        }

        // 判斷使用者權限
        
        const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [req.body.roles])

        if(req.body.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您沒有權限進行此操作"
            }); 
        }else{
            await Portfolio.client.query(`INSERT INTO "Portfolios" ("title", "years", "role", "item", "linkRel", "linkHref","linkAction","createdAt","updatedAt") VALUES ( $1, $2, $3, $4, $5 ,$6, $7, $8, $9 )`, 
            [createPortfolio.title, createPortfolio.years, createPortfolio.role, createPortfolio.item, createPortfolio.linkRel,createPortfolio.linkHref, createPortfolio.linkAction, new Date(), new Date()])

            return res.status(200).json({
                status: 200,
                data:{
                    createPortfolio
                }
            })        
        }
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });  
    }
})
router.put ('/:id', async (req,res) => {
    try {
        const BeforeUpdatedPort = {
            roles: req.query.roles,
        }

        const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1 `, [BeforeUpdatedPort.roles])
        

        if(findUser.roles !== 1 && BeforeUpdatedPort.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            });
        }else{        
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
            }
            
            // 判斷格式是否正確
            if(!updatePortfolio === ""){  
                return res.status(404).json({
                    status: 404,
                    error: "操作失敗：格式不正確"
                });
            }
        
            await Portfolio.client.query(`UPDATE "Portfolios" SET "title"= $1, "years" = $2, "role" = $3, "item" = $4, "linkRel" = $5, "linkHref" = $6, "linkAction" = $7, "createdAt" = $8, "updatedAt" = $9  WHERE "id" = $10`,[
                updatePortfolio.title, updatePortfolio.years, updatePortfolio.role, updatePortfolio.item, updatePortfolio.linkRel, updatePortfolio.linkHref, updatePortfolio.linkAction,new Date(), new Date(), updatePortfolio.id])

            
            const portfolioExists = await Portfolio.client.query(`SELECT * FROM "Portfolios" WHERE id = $1`,[req.body.id])
        
            // 找不到伺服器資料
            if (!portfolioExists.rows.length) {
                return res.status(404).json({
                    status: 404,
                    error: "操作失敗：找不到此項目"
                });
            }
            

            return res.status(200).json({
                status: 200,
                data: {
                    updatePortfolio
                }
            });
        }

    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });
    }
})
router.delete ('/:id', async (req,res) => {
    try {
        const deletePort = {
            id: req.body.id,
            roles: req.body.roles
        }

        const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1 `,[deletePort.roles]);

        // 操作失敗：找不到伺服器資料
        if(!userFind.rows.length){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：您的權限不足！"
            })
        }

        // 判斷權限開始！
        if(deletePort.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            });
        }else{
            const afterDeleted = await Portfolio.client.query(`DELETE FROM "Portfolios" WHERE id = $1 `,[deletePort.id])

            // 判斷此項目是不是已被刪除
            if(!afterDeleted.id){
                return res.status(404).json({
                    status: 404,
                    error: "此項目已經遭刪除"
                })
            }
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });
    }
})


module.exports = router