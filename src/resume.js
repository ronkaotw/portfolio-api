const serverless = require('serverless-http');
const express = require('express');
const router = express.Router();

// 引入 Model 文件
const Users = require('../../config/db.js')
const Resume = require('../../config/db.js');

router.get('/', async (req,res) => {
    try {
        const getResume = Resume.client.query(`SELECT * FROM "Resumes"`)

        if(!getResume){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到伺服器資料"
            })
        }else{
            const getResumes = (await getResume).rows.map(row =>({
                Name: row.name,
                Education: row.Education,
                Years: row.Years,
                linkRel: row.linkRel,
                linkHref: row.linkHref,
                linkAction: row.linkAction,
                expCpTitle: row.expCpTitle,
                expYears: row.expYears,
                pjTitle: row.pjTitle,
                pjDoSomething: row.pjDoSomething
            }))

            return res.status(200).json({
                status: 200,
                data:{
                    getResumes
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
router.post('/', async  (req,res) => {    
    try {
        const createResume = {
            roles: req.body.roles,
            Name: req.body.Name,
            Education: req.body.Education,
            Years: req.body.Years,
            linkRel: req.body.linkRel,
            linkHref: req.body.linkHref,
            linkAction: req.body.linkAction,
            expCpTitle: req.body.expCpTitle,
            expYears: req.body.expYears,
            pjTitle: req.body.pjTitle,
            pjDoSomething: req.body.pjDoSomething
        }
        
        const resumeFind = await Resume.client.query(`SELECT * FROM "Resumes" WHERE "Name" = $1`,[createResume.Name])

        // 找不到資料
        if(resumeFind === 0){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料",
            })
        }

        // 判斷格式不正確
        if(createResume === ""){  
            return res.status(401).json({
                status: 401,
                error: "操作失敗：格式不正確"
            });
        }
        
        
        // 判斷使用者權限
        await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`,[req.body.roles])

        if(req.body.roles !== 1 ){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您沒有權限進行此操作！"
            });
        }else{
            const afterCreated = await Resume.client.query(`INSERT INTO "Resumes" ("Name", "Education", "Years", "linkRel", "linkHref", "linkAction", "expCpTitle", "expYears", "pjTitle", "pjDoSomething", "createdAt", "updatedAt") 
                VALUES ( $1, $2, $3, $4, $5, $6 ,$7, $8, $9 ,$10, $11, $12)`,
                [createResume.Name,createResume.Education,createResume.Years,createResume.linkRel,createResume.linkHref,createResume.linkAction, createResume.expCpTitle,createResume.expYears,createResume.pjTitle, createResume.pjDoSomething, new Date(), new Date()])

            return res.status(200).json({
                status: 200,
                data:{
                    createResume
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

router.put('/:id', async (req,res) => {
    try {
        const BeforeUpdateResume = {
            roles: req.query.roles
        }

        const findUsers = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`,[BeforeUpdateResume.roles]);

        const user = findUsers.rows[0];
        
        if(!user || (user.roles !== 1 && BeforeUpdateResume.roles !== 1)){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            });
        }else{

            const updateResume = {
                id: req.body.id,
                Name: req.body.Name,
                Education: req.body.Education,
                Years: req.body.Years,
                linkRel: req.body.linkRel,
                linkHref: req.body.linkHref,
                linkAction: req.body.linkAction,
                expCpTitle: req.body.expCpTitle,
                expYears: req.body.expYears,
                pjTitle: req.body.pjTitle,
                pjDoSomething: req.body.pjDoSomething
            }

            if(updateResume === ""){ 
                return res.status(404).json({
                    status: 404,
                    error: "操作失敗：格式不正確"
                });
            }

            await Resume.client.query(`UPDATE "Resumes" SET "Name" = $1, "Education" = $2, "Years" = $3, "linkRel" = $4, "linkHref" = $5, "linkAction" = $6, "expCpTitle" = $7, "expYears" = $8, "pjTitle" = $9, "pjDoSomething" = $10, "createdAt" = $11, "updatedAt" = $12 WHERE "id" = $13`,
                [
                    updateResume.Name, 
                    updateResume.Education, 
                    updateResume.Years,
                    updateResume.linkRel,
                    updateResume.linkHref,
                    updateResume.linkAction,
                    updateResume.expCpTitle,
                    updateResume.expYears,
                    updateResume.pjTitle,
                    updateResume.pjDoSomething,  
                    new Date().toISOString(), 
                    new Date().toISOString(),  
                    updateResume.id
                ])

            const resumeExists = await Resume.client.query(`SELECT * FROM "Resumes" WHERE id = $1`, [BeforeUpdateResume.id])

            if(!resumeExists.id){
                return res.status(404).json({
                    status: 404,
                    error: "操作失敗：找不到此項目" 
                });
            }

            return res.status(200).json({
                status: 200,
                data:{
                    updateResume
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
router.delete('/:id', async (req,res) => {
    try {
        const deleteResume = {
            id: req.body.id,
            roles: req.body.roles
        }

        const findUsers = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [deleteResume.roles]);
        

        if(!findUsers){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料"
            })
        }

        // 權限判斷
        if(deleteResume.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            });
        }else{
            const afterDeleted = await Resume.client.query(`DELETE FROM"Resumes" WHERE id = $1`,[deleteResume.id]);

            if(!afterDeleted.id){
                return res.status(404).json({
                    status: 404,
                    error: "此項目已經遭刪除"
                })
            }
        }

        return res.status(200).json({
            status: 200,
            message: "DELETE /Resume"
        })   
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });
        
    }
})

module.exports = router