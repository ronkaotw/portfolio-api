const express = require('express');
const router = express.Router();

// 引入 Model 文件
const Users = require('../config/db.js');
const About = require('../config/db.js');

router.get('/', async (req,res)=>{
    try {   
        // 查詢所有 Abouts  
        const getAbout = await About.client.query(`SELECT * FROM "Abouts"`)

        if(!getAbout.rows.length){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到伺服器資料"
        })
        }else{
            const getAbouts = getAbout.rows.map(row =>({
                text: row.text,
                linkRel: row.linkRel,
                linkHref: row.linkHref,
                linkAction: row .linkAction
            }))

            return res.status(200).json({
                status: 200,
                data:{
                    getAbouts
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
router.post('/', async (req,res)=>{
    try {
        const createAbout = {
            text: req.body.text,
            linkRel: req.body.linkRel,
            linkHref: req.body.linkHref,
            linkAction: req.body.linkAction
        }
    
        const aboutFind = await About.client.query(`SELECT * FROM "Abouts" WHERE text = $1`,[createAbout.text])
    
        // 找不到伺服器資料
        if(aboutFind.text === 0){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料",
            })
        }

        // 判斷格式正不正確
        if(createAbout !== ""){  
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
                error: "操作失敗：您沒有權限進行此操作！"
            });
        }else{        
            await About.client.query(`INSERT INTO "Abouts" ("text", "linkRel", "linkHref", "linkAction", "createdAt", "updatedAt") VALUES ( $1, $2, $3, $4, $5 ,$6 )`, 
            [createAbout.text, createAbout.linkRel, createAbout.linkHref, createAbout.linkAction, new Date(), new Date()])
        
            return res.status(200).json({
                status: 200,
                data:{
                    createAbout
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
router.put('/:id', async (req,res)=>{
    try {
        const BeforeupdatAbout = {
            roles: req.query.roles
        }

        const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1 `, [BeforeupdatAbout.roles])
        
        if(findUser.roles !== 1 && BeforeupdatAbout.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            });
        }else{
            
        
            const updateAbout = {
                id: req.body.id,
                text: req.body.text,
                linkRel: req.body.linkRel,
                linkHref: req.body.linkHref,
                linkAction: req.body.linkAction
            }
            
            if(updateAbout !== ""){  
                return res.status(404).json({
                    status: 404,
                    error: "操作失敗：格式不正確"
                });
            }
        
            await About.client.query(`UPDATE "Abouts" SET "text"= $1, "linkRel" = $2, "linkHref" = $3, "linkAction" = $4, "createdAt" = $5, "updatedAt" = $6 WHERE "id" = $7`,[
                updateAbout.text, updateAbout.linkRel, updateAbout.linkHref, updateAbout.linkAction, updateAbout.id, new Date(), new Date()])
            
            
            const aboutsExists = await About.client.query(`SELECT * FROM "Abouts" WHERE id = $1`,[BeforeupdatAbout.id])

            // 找不到伺服器資料
            if (!aboutsExists.rows.length) {
                return res.status(404).json({
                    status: 404,
                    error: "操作失敗：找不到此項目"
                });
            }

            return res.status(200).json({
                status: 200,
                data: {
                    updateAbout
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
router.delete('/', async (req,res)=>{
    try {
        const deleteAbout = {
            id: req.body.id,
            roles: req.body.roles
        }

        const findUser = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1 `, [deleteAbout.roles])

        if(!findUser.rows.length){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料"
            })
        }

        if(deleteAbout.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            });
        }else{
            const afterDeleted = await About.client.query(`DELETE FROM "Abouts" WHERE id = $1`, [deleteAbout.id])

            // 判斷此項目是不是已被刪除
            if(!afterDeleted.id){
                return res.status(404).json({
                    status: 404,
                    error: "此項目已經遭刪除"
                })
            }
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });
        
    }
})

module.exports = router