const express           = require('express');
const morgan            = require('morgan');
const mongoose          = require('mongoose');
const Product              = require('./models/product');
const User              = require('./models/account');
const multer            = require('multer');
const path              = require('path');
const passport          = require('passport');
const flash             = require('express-flash');
const session           = require('express-session');
const exphbs            = require('express-handlebars');
const localStrategy     = require('passport-local').Strategy;
const bcrypt            = require('bcrypt');
const app               = express();
const MongoStore        = require('connect-mongo');
const mongoosePaginate  = require('mongoose-paginate-v2');

// Multer app
const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, 'uploads');
    },
    filename: (req, file, cb)=>{
        cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
    },
}); 
const upload = multer({ storage: storage });

// connect to mongodb & listen for requests
const dbURI = "mongodb+srv://nikobinev:nikicha2112@cluster0.bbrcezo.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(result => {
    app.listen(3000)
  })
  .catch(err => console.log(err));

// register view engine
app.set('view engine', 'ejs');

// middleware & static files
app.use(express.static('public'));
app.use(express.static('uploads'));
app.use(flash());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});
app.use(session({
  secret: "verygoodsecret",
  resave: false,
  saveUninitialized: true
}));


// PASSPORT
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function (user, done){
  done (null, user.id)
})
passport.deserializeUser(async function (id, done){
  try {
    const user = await User.findById(id).exec();
    done(null, user);
  } catch (err) {
    done(err);
  }
});

passport.use(new localStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ username: username }).exec();
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch)
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));


// GENERIC ROUTES
app.get('/create', (req, res) => {
  res.render('create', { title: 'About' });
});
app.get('/', (req, res) => {
  res.render('index', { products: Product.docs, title: 'About' });
});
app.get('/home', (req, res) => {
  res.render('index', { title: 'About' });
});
app.get('/register', (req, res) => {
  res.render('register', { title: 'About' });
});
app.get('/login', (req, res) => {
  res.render('login', { title: 'About' });
});

// CART POST/GET

app.post('/cart', function(req, res){
  const productId = Product._id
  console.log(productId);
})
app.get('/cart', function(req,res){
  res.render('cart', { products: data.docs,})
})

// ACCOUNT POST/GET
app.post('/register', async function(req, res) {
  try {
    const usernamea = req.body.username
    const existingUser = await User.findOne({ usernamea });

    if (existingUser) {
      // If the username is already in use, return an error message
      return res.status(400).json({ error: 'Username is already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);
    const user = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash
    });
    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating user');
  }
});

function isLoggedIn(req,res,next){
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

app.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));


// PRODUCT POST/GET
app.get('/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

app.get('/products/data', async (req, res) => {

  try {
    const { page, limit } = req.query;
    const options = {
      page: parseInt(page, 10) || 1,
      limit: parseInt(limit, 18) || 18,
    };

    const data = await Product.paginate({}, options);

    const nextPage = data.hasNextPage ? data.nextPage : null;
    const prevPage = data.hasPrevPage ? data.prevPage : null;


    res.render('products', { products: data.docs, title: 'All blogs',
     hasNextPage: data.hasNextPage, nextPage: data.nextPage,
     hasPrevPage: data.hasPrevPage, prevPage: data.prevPage });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/create', upload.single('image'), (req, res, next) => {
  
    // Create a new instance of the Product model with data from the request body
    const product = new Product({
      title: req.body.title,
      price: req.body.price,
      image: {
        data:req.file.filename,
        contentType:'image/png',
        filePath: req.file.path,
        name: req.file.filename,
      },
      body: req.body.body
    });
  
    // Save the product to MongoDB
    product.save()
      .then(savedProduct => {
        res.redirect('/'); // Return the saved product as JSON
      })
      .catch(err => {
        next(err); // Pass the error to the next middleware in the stack
      });
  });

app.get('/details/:id', (req, res) => {
    const id = req.params.id;
    console.log(id);
    Product.findById(id)
      .then(result => {
        res.render('details', { products: result, title: 'All blogs' });;
      })
      .catch(err => {
        console.log(err);
      });
});

app.post('/details/:id', (req, res) =>{
  const id = req.params.id;
  console.log(id);
})

// 404 page
app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
