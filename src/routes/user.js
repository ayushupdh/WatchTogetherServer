const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth  = require('../middleware/auth')


router.get('/users/getAll', async(req,res)=>{
    try{
        const users = await User.find();
        res.status(201).send(users)
    }catch(e){
        res.status(400).send(e)
    }
    
})
router.delete('/users/dumpAll', async(req,res)=>{
    try{
         await User.deleteMany();
        res.status(201).send({"message":"Users Deleted"})
    }catch(e){
        console.log({"errors":e});
    }
    
})
router.post('/users/signup',async (req, res)=>{
    const user =  new User(req.body)
        try{
            await user.save()
            const token = await user.generateToken()
            console.log(`token in routes ${token}`);
            res.status(201).send({user,token})
        }
        catch(e){
            console.log(e);
           res.status(400).send(e)    

        }
})

router.post('/users/login', async(req,res)=>{
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateToken()
        res.send({user,token} )
    } catch (error) {
        console.log(error);
        res.status(400).send()
    }
}) 
router.post('/users/logout',auth, async(req,res)=>{
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
          return token.token !== req.token;
        });
        await req.user.save();
        res.sendStatus(200);
      } catch (error) {
        console.log(error);
        res.sendStatus(404);
      }
}) 


router.get('/users/me', auth, async(req, res)=>{
    try{
        res.send(req.user)
    }catch(e){
        res.sendStatus(404);
        console.log(e);
    }
})



module.exports = router