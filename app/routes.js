const { ObjectID } = require("mongodb");

module.exports = function (app, passport, db) {

  var date = new Date().toUTCString().substring(0, 22)

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
    db.collection('entries').find().sort({ star: -1 }).toArray((err, result) => {
      if (err) return console.log(err);
      res.render('profile.ejs', {
        user: req.user,
        entries: result
      });
    });
  });


  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });


  // randomize restaurant server side ==============================================
  app.get('/entries/randomize', (req, res) => {
    db.collection('entries')
      .find({ star: { $gte: 2, $lte: 4 } }) // Filter by star ratings 3-5
      .toArray((err, result) => {
        if (err) return res.status(500).json({ error: 'Internal Server Error' });
        res.json(result);
      });
  });

  // restaurant routes ===============================================================

  app.post('/entries', (req, res) => {
    db.collection('entries').insertOne({ title: req.body.title, entry: req.body.entry, dateCreated: new Date().toLocaleString(), tagsArr: [], }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })


  //update tags  =================

  app.put('/entries', (req, res) => {
    console.log(req.body)
    db.collection('entries')
      .findOneAndUpdate({ _id: ObjectID(req.body.id) }, {
        $set: {
          star: req.body.amount + 1
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })


  //update jounral info/data 

  app.put('/entries/update', (req, res) => {
    console.log(req.body)

    db.collection('entries')
      .findOneAndUpdate({ _id: ObjectID(req.body.id) }, {
        $set: {
          title: req.body.updateTitle,
          entry: req.body.updateEntry,
          dateCreated: new Date().toLocaleString()
        },

      },
        {
          returnOriginal: false, // Option to return the updated document
          // sort: { _id: -1 },
          // upsert: true
        }, (err, result) => {
          if (err) return res.send(err)
          res.redirect('/profile')
        })
  })



  app.put('/entries/tag', (req, res) => {
    console.log(req.body);
  
    db.collection('entries')
      .findOneAndUpdate(
        { _id: ObjectID(req.body.id) },
        {
          $push: {
            tagsArr: req.body.updateTags,
          },
        },
        {
          returnOriginal: false,
        },
        (err, result) => {
          if (err) return res.send(err);
          res.redirect('/profile');
        }
      );
  });

  //
  app.post('/entries/view', (req, res) => {
    const entryId = req.body.id;

    db.collection('entries')
      .findOneAndUpdate(
        { _id: ObjectID(entryId) },
        { $set: { isVisible: { $not: "$isVisible" } } }, // Toggle visibility
        { returnOriginal: false },
        (err, result) => {
          if (err) return res.status(500).json({ error: 'Internal Server Error' });
          res.json(result);
        }
      );
  });


  app.delete('/entries', (req, res) => {
    db.collection('entries').findOneAndDelete({ _id: ObjectID(req.body.id) }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Entry deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
