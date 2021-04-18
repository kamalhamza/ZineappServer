
const express=require ('express');
const router=express.Router();
const mongoose=require('mongoose');
const {Product}=require ('../models/product') 
const {Category}=require('../models/category')// Importation du model
const multer=require('multer');//Lib géstionnaire de fichier (Image etc)

const FILE_TYPE_MAP ={ // Type de fichier accepter au niveau de la BDD
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg',
    'image/jfif':'jfif',
}

//********************************************************************************************************** */
//----------Image Upload------------
//DISK STORAGE
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid= FILE_TYPE_MAP[file.mimetype];
        let uploadError=new Error('Type de Fichier invalide')

        if(isValid){
            uploadError=null
        }
        

        
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        
      const fileName=file.originalname.split(' ').join('-');
      const extension=FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
    }
  })
  const uploadOptions = multer({ storage: storage })

//********************************************************************************************************** */
//----------Get liste des produits------------
router.get(`/`,async (req,res)=>{

    let filter ={};//Filter est un objet si il est vide retourne tout les produits,sinon retour le tout
    if(req.query.categories){//Si y'a une query (Afin de chosir si on veut faire une recherche par categorie ou montrer le tout)
        filter={category:req.query.categories.split(',')}//Prend la query et voir si y'a une virgule pour afficher deux catégories ou plusieurs
    }

    const productList =await Product.find(filter).populate('category');//Choix de l'affichage par cattegorie

    if(!productList){//Si productlist Existe c'est a dire si il trouve la liste des produits
        res.status(500).json({success : false})
    }
    res.send(productList);
    
})

//----------Get un seul produit------------
router.get('/:id',async (req,res)=>{

    const product =await Product.findById(req.params.id);//populate permet de montrer la catégorie en utilisant la ref utilisé au niveau du Schema du product

    if(!product){
        res.status(500).json({success : false})
    }
    res.send(product);
    
})
//********************************************************************************************************** */

// -------------Ajout Produit----------------
router.post(`/`,uploadOptions.single('image'), async (req,res)=>{
    const category=await Category.findById(req.body.category);
    if (!category)
    return res.status(400).send('Invalid category')

    const file=req.file;
    if (!file)
    return res.status(400).send("Il n'y'a pas de fichier")


    const fileName=req.file.filename
    const basePath=`${req.protocol}://${req.get('host')}/public/uploads/`;

    let product =new Product({
     name:req.body.name,
     description:req.body.description,
     richDescription:req.body.richDescription,
     image:`${basePath}${fileName}`,
     images:req.body.images,
     brand:req.body.brand,
     price:req.body.price,
     category:req.body.category,
     countInStock:req.body.countInStock,
     rating:req.body.rating,
     numReviews: req.body.numReviews,
     isFeatured :req.body.isFeatured,
    })

//----Sauvegarde au niveau de La BD------
    product=await product.save();
    
    if (!product)
    return res.status(500).send("Le produit n'a pas été créer");

    return res.send(product);
    
})

//********************************************************************************************************** */
// -------------Modifier Produit----------------
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid Product Id");
  }
 
  const file = req.file;
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).send("Invalid Category");
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
 
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );
 
  if (!product) return res.status(500).send("the product cannot be updated!");
 
  res.send(product);
});
//********************************************************************************************************** */
// -------------Supprimer Produit----------------
router.delete('/:id',(req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)) //Validé l'id
    res.status(400).send('Invalid produit')

    Product.findByIdAndRemove(req.params.id).then(product=>{
        if (product){
            return res.status(200).json({success:true,message:'produit supprimé'})
        }
        else {
        return res.status(404).json({success:false,message:'le produit na pas été trouvé'})}
    })
    .catch(err=>{
        return res.status(400).json({success:false,error : err})
    })
})
//********************************************************************************************************** */
// -------------Compter le nombre de  Produit----------------
router.get('/get/count',async (req,res)=>{

    const productCount =await Product.countDocuments((count=>count))

    if(!productCount){
        res.status(500).json({success : false})
    }
    res.send({
        productCount :productCount
    });
    
})

//********************************************************************************************************** */
// -------------les produits featured----------------
router.get('/get/featured/:count',async (req,res)=>{
    const count =req.params.count ? req.params.count :0 //Prend le param count pour le nb de featured que vous voulez afficher

    const products =await Product.find({isFeatured:true}).limit(+count)

    if(!products){
        res.status(500).json({success : false})
    }
    res.send(products);
    
})

//********************************************************************************************************** */
// -------------Ajouter une galerie d'image pour le produit----------------
router.put(
    '/gallery-images/:id', 
    uploadOptions.array('images', 10), 
    async (req, res)=> {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('Invalid Product Id')
         }
         const files = req.files
         let imagesPaths = [];
         const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

         if(files) {
            files.map(file =>{
                imagesPaths.push(`${basePath}${file.filename}`);
            })
         }

         const product = await Product.findByIdAndUpdate(
            req.params.id,
            {
                images: imagesPaths
            },
            { new: true}
        )

        if(!product)
            return res.status(500).send('the gallery cannot be updated!')

        res.send(product);
    }
)
module.exports=router;
