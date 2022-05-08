const listingRoutes = require('./listings');
const profileRoutes = require('./profile');
const accountRoutes = require('./account');
const data = require('../data');
const usersData = data.users;
const validation = require('../validations');

const constructorMethod = (app) => {
    //Default route
    app.get("/", (req, res) => {
        if (req.session.isAuthenticated) {
            res.redirect("/home");
        } else {
            res.redirect("/landing");
        }
    });

    //Home page route
    app.get("/chat", (req, res) => {
        res.render("personalChat", { layout: "index" });
    });

    //Home page route
    app.get("/home", (req, res) => {
        res.render("home", { layout: "index" });
    });

    //Home page route
    app.get("/landing", (req, res) => {
        res.render("landing", { layout: "index" });
    });

    app.use('/listings', listingRoutes);
    app.use('/profile', profileRoutes);
    app.use('/account', accountRoutes);

    app.use('*', (req, res) => {
        return res.status(404).json({ Error: 'Resource not found' });
    });
};

module.exports = constructorMethod;