require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// 引入 Model 模型
const Users = require('../../config/db.js')

router.post('/Login',async (req,res)=>{
    // 輸入登入帳號
    const loginInput = {
        username: req.body.username,
        password: req.body.password
    }

    // 檢查 username 和 password 是否存在
    if (!loginInput.username || !loginInput.password) {
        return res.status(401).json({ 
            status: 401,
            error: "操作失敗：請輸入帳號和密碼" 
        });
    }
    
    try {
        // 判斷密碼是否正確
        const findUserPwd = await Users.client.query(`SELECT * FROM "Users" WHERE username = $1`,[loginInput.username]);

        if(!findUserPwd){
            return res.status(404).json({ 
                status: 404,
                error: "操作失敗：使用者未找到" 
            });
        }

        const comparePwd = await bcrypt.compare(loginInput.password, findUserPwd.rows[0].password );

    
        // 比對帳號與密碼是否正確
        const findUserAccount = await Users.client.query(`SELECT * FROM  "Users" WHERE username = $1`,[loginInput]);
    
        let loginOutput = {
            username:req.body.username,
        }

        // 判斷帳號密碼格式
        if(loginInput == ""){ 
            return res.status(401).json({
                status: 401,
                error: "操作失敗：帳號密碼格式不正確"
            });
        }


        if(loginInput.username !== loginInput.password && loginInput.password !== comparePwd){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：帳號或密碼錯誤！"
            })
        }else{
            const Token = jwt.sign({ id: findUserAccount.id }, `process.env.JWT_SECRET`, {
                expiresIn: '1h',
            });
    
            return res.status(200).json({
                status: 200,
                data:{
                    loginOutput
                },
                Token
            })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤"
        });
        
    }
   
});
// 需要權限才可進行操作
router.get('/', async (req,res) => {
    try {
        // 請求伺服器資料
        const usersRole =  {
            roles: req.body.roles,
        }
        
        // 尋找資料庫內的檔案 
        const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE roles = $1`, [usersRole.roles]);
    
        // 找不到伺服器資料
        if(!userFind.rows.length){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料",
            })
        }
    
        if(usersRole.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您沒有權限進行此操作！"
            });
        }else{
            // 取得所有使用者資料
            const getUserAllAct = userFind.rows.map(user => ({
                username: user.username,
                password: user.password,
                roles: user.roles
            }));
        
            return res.status(200).json({
                status: 200,
                data:{
                    getUserAllAct
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
// POST /Users
router.post('/',async(req, res) => {
    try {

        // 新增一筆使用者，讀取資料
        const createUser = {
            username: req.body.username,
            password: req.body.password,
            roles: req.body.roles
        }

        // 尋找資料庫內的檔案 
        const userFind = await Users.client.query(`SELECT * FROM "Users" WHERE username = $1`, [createUser.username]);
    
        // 找不到伺服器資料
        if(userFind.username === 0){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料",
            })
        }
    
        const hashedPassword = await bcrypt.hash(createUser.password, 10);
    
        if(createUser.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            })
        }else{
            // username 格式錯誤
            if(createUser.username === "" && createUser.password === ""){
                return res.status(401).json({
                    status:401,
                    error:"操作失敗：帳號格式不正確！"
            })
            }else{
                await Users.client.query(`INSERT INTO "Users" ("username", "password", "roles", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5) `, [
                    createUser.username, hashedPassword, createUser.roles, new Date(), new Date()]);
    
                const newUser = {
                    username: req.body.username,
                    password: hashedPassword,
                    roles: req.body.roles
    
                }
    
                return res.status(200).json({
                    status: 200,
                    data:{
                        newUser
                    }
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
});
router.delete('/:id', async (req,res)=>{
    try {
        const deleteInput = {
            id: req.body.id,
            roles: req.body.roles
        }
    
        const findUserAct = await Users.client.query(`SELECT * FROM "Users" WHERE id = $1`,[deleteInput.id]);

        if(findUserAct.rows.id > 0 ){
            return res.status(404).json({
                status: 404,
                error: "操作失敗：找不到資料"
            })
        }
    
        if(deleteInput.roles !== 1){
            return res.status(401).json({
                status: 401,
                error: "操作失敗：您的權限不足！"
            })
        }else{
            const afterDeleted = await Users.client.query(`DELETE FROM "Users" WHERE id = $1`,[deleteInput.id])
            
            if(!afterDeleted.id){
                return res.status(404).json({
                    status: 404,
                    message: "帳號已遭擁有者刪除",
                })  
            }
    
            return res.status(200).json({
                status: 200,
                message: "帳號已刪除",
            })   
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            error: "內部伺服器錯誤",
        })   
    }
});

module.exports = router;