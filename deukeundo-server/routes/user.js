const express = require('express');
const { check, validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const User = require('../model/User');
const auth = require('../middleware/auth');

router.post("/signup", [
    check("nom", "Entrer un nom valide").not().isEmpty(),
    check("prenom", "Entrer un prénom valide").not().isEmpty(),
    check("email", "Entrer un email valide").isEmail(),
    check("password", "Entrer un mot de passe valide").isLength({min: 8})
],
async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const {nom, prenom, email, password} = req.body;
    try {
        let user = await User.findOne({
            email
        });
        if (user) {
            return res.status(400).json({
                msg: "Cet email est déjà utilisé!"
            });
        }

        user = new User({
            nom,
            prenom,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.id
            }
        };

        jwt.sign(
            payload,
            "randomString", {
                expiresIn: 10000
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token
                });
            }
        );
    } catch (err) {
        console.log(err.message);
        res.status(500).send("Erreur lors de l'enregistrement des informations");
    }
}

);

router.post("/login",[
    check("email", "Entrer un email valide").isEmail(),
    check("password", "Entrer un mot de passe valide").isLength({min: 8})
],
async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }
    const { email, password } = req.body;
    try {
        let user = await User.findOne({
            email
        });
        if (!user) {
            return res.status(400).json({
                message: "Cet utilisateur n'exixte pas!"
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({
                message: " Mot de passe incorrecte!"
            });
        }
        const payload = {
            user: {
                id: user.id
            }
        };
        jwt.sign(
            payload,
            "randomString",
            {
                expiresIn: 3600
            },
            (err, token) => {
                if (err) throw err;
                res.status(200).json({
                    token
                });
            }
        );
    } catch (e) {
        console.error(e);
        res.status(500).json({
            message: "Une erreur s'est produite au niveau du serveur"
        });
    }
}
);

router.get("/accueil", auth, async(req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch(e) {
        res.send({ message: "Erreur de récupération des informations!"});
    }
});

module.exports = router;