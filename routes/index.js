const constructorMethod = (app) => {
    app.use('*', (req, res) => {
        return res.status(404).json({ Error: 'Resource not found' });
    });
};

module.exports = constructorMethod;