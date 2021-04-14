const express=require ('express');
const router=express.Router();
const bcrypt=require ('bcryptjs'); // Importation bibliothéque cryptage password
const {User}=require ('../models/user'); // Importation du model
const { restart } = require('nodemon');
const jwt=require('jsonwebtoken');
const mongoose=require('mongoose');

//********************************************************************************************************** */
//----------Get liste des users------------
router.get(`/`,async (req,res)=>{

    const userList =await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json({success : false})
    }
    res.send(userList);
    
})

//********************************************************************************************************** */
//----------Get chaque utilisauter------------
router.get('/:id',async (req,res)=>{
    const user = await User.findById(req.params.id).select('name phone email ');//ne montrer que le nom phone et email
    if (!user){
        res.status(500).json({message:"l'utilisateur est introuvable"})
    }
    res.status(200).send(user);
})
//********************************************************************************************************** */
// -------------créer user(ADMIN)----------------
router.post(`/`,async (req,res)=>{

    let user =new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

//----Sauvegarde au niveau de La BD------
    user = await user.save();
    if (!user)
        return res.status(404).send ("Utilisateur ne peux pas être créer")

    res.send (user);
})

//********************************************************************************************************** */
// -------------créer user(INSCRIPTION)----------------
router.post(`/register`,async (req,res)=>{

    let user =new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password,10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

//----Sauvegarde au niveau de La BD------
    user = await user.save();
    if (!user)
        return res.status(404).send ("Utilisateur ne peux pas être créer")

    res.send (user);
})

//********************************************************************************************************** */
// -------------Connexion----------------
router.post ('/login',async(req,res)=>{
    const user = await User.findOne({email:req.body.email})//On cherche l'email utilisateur'
    const secret=process.env.secret;
    if (!user){
        return res.status(400).send('utilisateur introuvable')
    }
     if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){// On compare le mdp haché et si l'utilisateur existe
         const token= jwt.sign( //On génére le token utilisateur
             {
                 userId:user.id,
                 isAdmin:user.isAdmin,
                
             },
             secret,//Le mot de passe secret
             {
                 expiresIn :'1d'//temps d'expiration du token avant deconnexion
             }
         )
        res.status(200).send ({user:user.email,token:token})
    }
    else{
        res.status(400).send ('Faux mot de passe')
    }
   

})
//********************************************************************************************************** */
// -------------Compter le nombre de  Produit----------------
router.get('/get/count',async (req,res)=>{

    const userCount =await User.countDocuments((count=>count))

    if(!userCount){
        res.status(500).json({success : false})
    }
    res.send({
        userCount :userCount
    });
    
})
//********************************************************************************************************** */
//-------------------------SUPPRIMER UN utilisateur(ADMIN)-------------------------------------------
router.delete('/:id',(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)) //Validé l'id
    res.status(400).send('Invalid utilisateur')

    User.findByIdAndRemove(req.params.id).then(user=>{
        if (user){
            return res.status(200).json({success:true,message:'utilisateur supprimé'})
        }
        else {
        return res.status(404).json({success:false,message:'Lutilisateur na pas été trouvé'})}
    })
    .catch(err=>{
        return res.status(400).json({success:false,error : err})
    })
})
module.exports=router;