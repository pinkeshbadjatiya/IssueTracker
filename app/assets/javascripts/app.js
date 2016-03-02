var app = angular.module('flapperNews', ['ui.router', 'Devise', 'ngTagsInput','ngSanitize','textAngular']).config([
    '$stateProvider',
    '$urlRouterProvider',
    function($stateProvider, $urlRouterProvider) {

      $stateProvider.state('home', {
        url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }

      });

      $stateProvider.state('posts', {
        url: '/posts/{id}',
        templateUrl: '/posts.html',
        controller: 'PostsCtrl',
        resolve: {
          post: ['$stateParams', 'posts', function($stateParams, posts) {
            return posts.get($stateParams.id);
          }]
        }
      });

      $stateProvider.state('comments', {
        url: '/posts/{id}/comments/',
        templateUrl: '/comments.html',
        controller: 'CommentCtrl',
        onEnter: ['$state', 'Auth', function($state, Auth) {
          Auth.currentUser().then(function (){
            $state.go('home');
          })
        }]
      });


      $stateProvider.state('login', {
        url: '/login',
        templateUrl: '/login.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'Auth', function($state, Auth) {
          Auth.currentUser().then(function (){
            $state.go('home');
          })
        }]
      });

      $stateProvider.state('register', {
        url: '/register',
        templateUrl: '/register.html',
        controller: 'AuthCtrl',
        onEnter: ['$state', 'Auth', function($state, Auth) {
          Auth.currentUser().then(function (){
            $state.go('home');
          })
        }]
      });

      $urlRouterProvider.otherwise('home');
    }])


app.factory('Poller', function($http, $timeout) {
  var data = { response: {}, calls: 0 };
  var poller = function() {
    $http.get('/msgs/1.json').then(function(r) {
      data.response = r.data;
      data.calls++;
      for(i in r.data)
        {
          //ngNotify.set(r.data[i]['body']);
          $.notify(r.data[i]['body'], "info");
        }
      console.log(JSON.stringify(r.data));
      $timeout(poller, 1000);
    });
  };

  poller();
  return {
    data: data
  };
});


app.factory('posts', ['$http', function($http){
  var o = {
    posts: []
  };

  var authentication='none';
  o.getAuth = function() {
    return authentication;
  };

  o.setAuth = function(user) {
    authentication = user;
  };

  o.getAll = function() {
    return $http.get('/posts.json').success(function(data){
      angular.copy(data, o.posts);
    });
  };

  o.create = function(post) {
    return $http.post('/posts.json', post).success(function(data){
      o.posts.push(data);
      $.notify("Project Added Successfully !!", "success");
    });
  };

  o.pSol = function(id, text) {
    return $http.get('/posts/' + 1 + '/comments/' + 1 + '/addsolution/?ccid=' + id + '&body=' + text)
      .success(function(data){
        $.notify("Comment Posted, successfully.", "success");
      }).error(function(data){
        $.notify("Oops, Something went Wrong. Try Again :(", "error");
        location.reload();
      });
  };

  o.getTags = function(id) {
    return $http.get('/tags.json?id=' + id);
    //.success(function(data){
    //   console.log('Tags retrived for ' + id);
   // });
  };



  o.upvote = function(post) {
    return $http.put('/posts/' + post.id + '/upvote.json')
      .success(function(data){
        post.upvotes += 1;
        $.notify("Upvote Success !!", "success");
      }).error(function(data,status){
        $.notify("Not Authorised.", "error");
        //console.log(status)
      });
  };

  o.addmember = function(post, email) {
    return $http.get('/posts/' + post.id + '/addmember/?eml=' + email + '&id=' + post.id)
      .success(function(data){
        $.notify(email + " - User email submitted for processing.", "info");
        //post.upvotes += 200;
        //alert(email + '- User added to the project list. :)');
      }).error(function(data){
        $.notify("Oops, Something went Wrong. Try Again :(", "error");
      });
  };

  o.addTags = function(post, tags) {
    return $http.get('/posts/' + post.id + '/pushtags/?pid=' + post.id + '&tgs=' + tags)
      .success(function(data){
        $.notify("Tags Updated successfully. !!", "success");
      }).error(function(data){
        $.notify("Oops, Something went Wrong. Try Again :(", "error");
      });
  };

  o.delcomment = function(comment) {
    return $http.get('/posts/' + comment.id + '/comments/' + comment.id + '/delcomment/?cid=' + comment.id)
      .success(function(data){
        $.notify("Issue Deleted from Project, successfully.", "success");
        location.reload();
      }).error(function(data){
        $.notify("Oops, Something went Wrong. Try Again :(", "error");
      });
  };



  o.delmember = function(post, email) {
    return $http.get('/posts/' + post.id + '/delmember/?eml=' + email + '&id=' + post.id)
      .success(function(data){
        $.notify("User removed from Project, successfully.", "success");
      }).error(function(data){
        $.notify("Oops, Something went Wrong. Try Again :(", "error");
      });
  };

  o.delpost = function(post) {
    return $http.get('/posts/' + post.id + '/delpost/?id=' + post.id)
      .success(function(data){
        $.notify("Project Deleted !!", "success");
        location.reload();
      }).error(function(data){
        $.notify("Oops, Something went Wrong. Try Again later :(", "error");
      });
  };

  o.get = function(id) {
    return $http.get('/posts/' + id + '.json').then(function(res){
      return res.data;
    });
  };

  o.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments.json', comment).success(function(data){
      $.notify("Issue posted.", "success");
    });
  };

  o.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post.id + '/comments/'+ comment.id + '/upvote.json')
      .success(function(data){
        comment.upvotes += 1;
        $.notify("Upvote Successfull.", "success");
      }).error(function() {
      $.notify("Oops, Something looks fishy. Try Again :(", "error");
      });
  };

  return o;
}])

app.controller('PostsCtrl', [
    '$scope',
    'posts',
    'post',
    'Auth',
    '$interval',
    function($scope, posts, post, Auth, $interval){

      console.log(JSON.stringify(post.comments));
      $scope.post = post;
      $scope.loggedInPost = false;
      $scope.query = {};
      $scope.queryBy = '$';
      $scope.orderProp='body';

      $scope.solve = "";
      temp = [];

      $scope.allcomments = post.comments;

//  console.log('>>>>>>>>>>>>>>>>>>>>>>>> ' + JSON.stringify($scope.allcomments));
//      for(i=0;i<$scope.allcomments.length;i++)
//{
//  posts.getTags($scope.allcomments[i].id).then(function(res){
//   console.log('=========' + JSON.stringify(res['data']));
//   temp = res['data']['title'];
//   console.log('TTTT -' + temp);
//  });
//  $scope.allcomments[i]['tags'] = temp;
//  console.log($scope.allcomments[i]);
//}
//  console.log('>>>>>>>>>>>>>>>>>>>>>>>> ' + JSON.stringify($scope.allcomments));

      $scope.notification = '';
      $scope.notice = function(msg) {
        $interval(function(){
          $scope.notification = msg;
          //console.log($scope.notification);
        },200,1);
        $interval(function(){
          $scope.notification = '';
          //console.log($scope.notification);
        },3000,1);
      };

      Owner = false;
      $scope.checkOwner = function() {
        console.log('Last Owner-' + Owner);
        return Owner;
      };

      Auth.currentUser().then(function(user){
        console.log('---------');
        console.log(user);
        posts.setAuth(user);
        console.log('IS_OWNER');
        console.log('???????????????');
        console.log(user);
        console.log(post);
        console.log('???????????????');
        console.log(user.id == post.user_id);
        Owner = (user.id == post.user_id);
      console.log(Owner);
      console.log('||||||||||||||||||||||');

        //if (user.id === post.user_id)
        //$scope.loggedInPost = true;
      });
      //console.log($scope.loggedInPost);

      //console.log(posts.getAuth());
      console.log(Owner);
      console.log('================');

      $scope.addComment = function(){
        if($scope.body === '') {
          return;
        }
        posts.addComment(post.id, {
          body: $scope.body,
          author: 'user',
          description: $scope.description,
          upvotes: 0
        }).success(function(comment) {
          if (comment == '') {
            d=9;
            //$scope.notice('Not Authorised !!');
          }
          else {
            $scope.post.comments.push(comment);
            //$scope.notice('Issue Posted Successfully.');
          }
        });

        $scope.body = '';
        $scope.description = '';
      };


      //$scope.tags = [];

      $scope.pushTags = function(post) {
      s = '';
        for(t in $scope.tags)
        {
          s = s + ',' + $scope.tags[t]['text'];
          console.log($scope.tags[t]['text']);
        }
        console.log(s);
        s=s.substring(1);
        console.log('Transacted = ' + s);
        //posts.addtags(post,s);
      };

      $scope.addMembertoProject = function() {
        posts.addmember(post, $scope.email);
        console.log('MEMBER Add - REQUEST');
        //$scope.notice($scope.email + ' added onto project members.');
        $scope.email = '';
      };

      $scope.delMemberfromProject = function() {
        posts.delmember(post, $scope.delemail);
        console.log('MEMBER Delete - REQUEST');
        //$scope.notice($scope.delemail + ' deleted form project members.');
        $scope.delemail = '';
      };


      $scope.incrementUpvotes = function(comment){
        posts.upvoteComment(post, comment);
        //$scope.notice('Upvote Successful !!');
      };

      $scope.delComment = function(comment) {
        posts.delcomment(comment);
        console.log('comment del req');
      };

      $scope.pushTags = function(idx,id,tgs) {
        if(tgs.length == 0)
        {
       // console.log('UNDEF TE-'+tgs);
          return;
      }
        console.log('TE-'+JSON.stringify(tgs));
       console.log(JSON.stringify($scope.allcomments[idx]['solutions']));
        $scope.allcomments[idx]['solutions'].push({
          body:text,
          comment_id: id,
          username: posts.getAuth()['username']
        });
        posts.pSol(id, text);
       console.log(JSON.stringify($scope.allcomments[idx]['solutions']));
        console.log('solution ad request');
        $(document).ready(function() {
            $('.blank').find('input:text').val('');    
        });
      };


      $scope.pSolution = function(idx,id,text) {
        if(text==undefined)
        {
          $.notify("Sorry, But you can't leave the text area blank. :(", "warn");
          return;
      }
       // console.log('TE-'+text);
       //console.log(JSON.stringify($scope.allcomments[idx]['solutions']));
        $scope.allcomments[idx]['solutions'].push({
          body:text,
          comment_id: id,
          username: posts.getAuth()['username']
        });
        posts.pSol(id, text);
       //console.log(JSON.stringify($scope.allcomments[idx]['solutions']));
        console.log('solution ad request');
        $(document).ready(function() {
            $('.blank').find('input:text').val('');    
        });
      };

    }]);


app.controller('MainCtrl', [
    '$scope',
    'posts',
    'Poller',
    'Auth',
    '$interval',
    function($scope, posts, Poller, Auth, $interval){

      $scope.msg = Poller.poller;
      $scope.posts = posts.posts;
      Auth.currentUser().then(function(user){
        $scope.user = user;
      });
      deletesuccess = false;

      //console.log($scope.posts);
      $scope.options = ['true','false'];

      $scope.notification = '';
      $scope.notice = function(msg) {
        $interval(function(){
          $scope.notification = msg;
          console.log($scope.notification);
        },200,1);
        $interval(function(){
          $scope.notification = '';
          console.log($scope.notification);
        },3000,1);
      };


      $scope.delPost = function(post, index) {
        console.log(post);
        posts.delpost(post);
        console.log('>>>' + deletesuccess);
        //if (deletesuccess){
        //  $scope.posts.splice(index, 1);
        //  deletesuccess = false;
        //  console.log('DELETED !! YES');
        //}
        console.log('POST Delete - REQUEST');
        //$scope.notice($scope.delemail + ' deleted form project members.');
      };


      $scope.incrementUpvotes = function(post) {
        console.log(post);
        X=posts.upvote(post);
        console.log(X);
        console.log(X);
        //$scope.notice('Post Upvotes Successful');
      };

      $scope.addPost = function(){
        if(!$scope.title || $scope.title === '') { return; }
        posts.create({
          title: $scope.title,
          link: $scope.link,
          upvotes: 0,
          issecure: $scope.issecure,
          comments: [
        {author: 'Joe', body: 'Cool post!', upvotes: 0},
          {author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
        ]
        });
        $scope.title = '';
        $scope.link = '';
        //$scope.notice('Project: Post successfully posted');
      };

    }]);



app.controller('NavCtrl', [
    '$scope',
    'Auth',
    'posts',
    '$interval',
    function($scope, Auth, posts, $interval){
      $scope.signedIn = Auth.isAuthenticated;
      $scope.logout = Auth.logout;

      $scope.notification = '';
      $scope.notice = function(msg) {
        $interval(function(){
          $scope.notification = msg;
          console.log($scope.notification);
        },200,1);
        $interval(function(){
          $scope.notification = '';
          console.log($scope.notification);
        },3000,1);
      };


      Auth.currentUser().then(function (user){
        posts.setAuth(user);
        $scope.user = user;
      });

      $scope.$on('devise:new-registration', function (e, user){
        $scope.user = user;
        $.notify("Welcome, New User", "info");
        poller();
        //$scope.notice('Welcome. New User !!')
      });

      $scope.$on('devise:login', function (e, user){
        $scope.user = user;
        $.notify("LogIn Successfull.", "success");
        $.notify("Welcome, "+ user.username, "info");
        //$scope.notice('LogIn Success !!');
      });

      $scope.$on('devise:logout', function (e, user){
        $scope.user = {};
        //$scope.notice('LogOut Sucess.');
        location.reload()
        $.notify("Logged Out.", "info");
      });

    }]);

app.controller('CommentCtrl', [
    '$scope',
    'posts',
    'Auth',
    function($scope, posts, Auth){
      $scope.solutions = "ssssdddd";
    }]);



app.controller('AuthCtrl', [
    '$scope',
    '$state',
    'Auth',
    function($scope, $state, Auth){

      $scope.login = function() {
        Auth.login($scope.user).then(function(){
          $state.go('home');
        });
      };

      $scope.register = function() {
        Auth.register($scope.user).then(function(){
          $state.go('home');
        });
      };
    }]);


