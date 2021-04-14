
function errorHandler(err, req, res, next){
    if(err.name==='UnauthorizedError'){
        //Message d'erreur quand le TOKEN user est faux
        return res.status(401).json({message :"l'utilisateur n'est pas autorisé"})
    }

    if(err.name ==='ValidationError'){
        //Quand le serveur ne valide pas
        return res.status(401).json({message :err})}

    return res.status(500).json(err)// Autres erreur
}
module.exports = errorHandler;