const { response } = require('express');
const express=require ('express');
const router=express.Router();
const mongoose=require('mongoose');
const {Category}=require ('../models/category') // Importation du model

//********************************************************************************************************** */
//----------liste des catégories------------
router.get(`/`,async (req,res)=>{

    const categoryList =await Category.find();

    if(!categoryList){
        res.status(500).json({success : false})
    }
    res.status(200).send(categoryList);
})
//********************************************************************************************************** */

//----------Afficher detail pour chaque categorie------------
router.get('/:id',async (req,res)=>{
    const category = await Category.findById(req.params.id);
    if (!category){
        res.status(500).json({message:'La catégorie est introuvable'})
    }
    res.status(200).send(category);
})

//********************************************************************************************************** */

// -------------Ajout nouvelle catégorie----------------
router.post(`/`, async (req,res)=>{
    let category =new Category({
     name:req.body.name,
     icon:req.body.icon,
     color:req.body.color,
     image :req.body.image
    })
//----Sauvegarde au niveau de La BD------
   category = await category.save();
    if (!category)
    return res.status(404).send ("Categorie ne peux pas être créer")
    
    res.send (category);
})
//********************************************************************************************************** */
//-------------------------SUPPRIMER UNE CATÉGORIE-------------------------------------------
router.delete('/:id',(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)) //Validé l'id
    res.status(400).send('Invalid categorie')

    Category.findByIdAndRemove(req.params.id).then(category=>{
        if (category){
            return res.status(200).json({success:true,message:'Categorie supprimé'})
        }
        else {
        return res.status(404).json({success:false,message:'Categorie na pas été trouvé'})}
    })
    .catch(err=>{
        return res.status(400).json({success:false,error : err})
    })
})
//********************************************************************************************************** */
//----------modifier categorie------------
router.put('/:id',async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)) //Validé l'id
    res.status(400).send('Invalid categorie')

    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name:req.body.name,
            icon:req.body.icon,
            color:req.body.color,
            image:req.body.image,
        },
        {
            new:true
        }
        
        )
        if (!category)
        return res.status(404).send ("Categorie ne peux pas être modifier")
        res.send (category);
        

})



module.exports=router;