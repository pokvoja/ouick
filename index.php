<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Tablz</title>

  <script src="./bower_components/jquery/dist/jquery.min.js"></script>
  <script src="./bower_components/datatables/media/js/jquery.dataTables.min.js"></script>
  <script src="./bower_components/angular/angular.min.js"></script>
  
  <script src="./js/inc/angular-route.min.js"></script>
  <script src="./bower_components/angular-datatables/dist/angular-datatables.min.js"></script>
  <link rel="stylesheet" href="./bower_components/angular-datatables/dist/css/angular-datatables.css">

  <script src="js/inc/ui-bootstrap-custom-tpls-1.3.3.js"></script>
  <script>
<?php
//quick and dirty solution until factory is build
include('inc/class_db.php');
$db = new db();
echo 'var field_types = '. json_encode($db->shiftResult($db->query("SELECT * FROM `field_types` WHERE active='1' ORDER BY order_id ASC"),'id'));

 ?>
  </script>
  <script src="js/script.js"></script>



  <link rel="stylesheet" href="./css/bootstrap.css">
  <link rel="stylesheet" href="./css/font-awesome.min.css">
  <link rel="stylesheet" href="./css/style.css">
  <script src="./js/inc/bootstrap.min.js"></script>

</head>
<body ng-app="single-page-app">
  <div ng-controller="cfgController">
  <div>
  <nav class="navbar navbar-inverse" role="navigation" style="padding-left:130px;">
      <ul class="nav navbar-nav">
        <li class="active"><a href="#/">Home<span class="sr-only">(current)</span></a></li>
        <li ng-controller="tableMenuController">
                    <a class="dropdown-toggle" data-toggle="dropdown">Data<b class="caret"></b></a>
                    <ul class="dropdown-menu multi-level">
                        <li><a href="#">Action</a></li>
                        <li><a href="#">Another action</a></li>
                        <li><a href="#">Something else here</a></li>
                        <li class="divider"></li>
                        <li><a href="#">Separated link</a></li>
                        <li class="divider"></li>
                        <li><a href="#">One more separated link</a></li>
                        <li class="dropdown-submenu" ng-repeat="n in datasets track by $index">
                          <a href="#" class="dropdown-toggle" data-toggle="dropdown">{{n.title}}</a>
                          <ul class="dropdown-menu">
                                <li><a href="#">Action</a></li>
                                <li class="dropdown-submenu">
                                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">Tables</a>
                                            <ul class="dropdown-menu">
                                                <li ng-repeat="table in tables track by $index"><a href="#/tables/{{table.id}}/">{{table.title}}</a></li>
                                                <li><a href="#">Another action</a></li>
                                                <li><a href="#">Something else here</a></li>
                                                <li class="divider"></li>
                                                <li><a href="#">Separated link</a></li>
                                                <li class="divider"></li>
                                                <li><a href="#">One more separated link</a></li>
                                            </ul>
                                </li>
                            </ul>
                        </li>

                        
                    </ul>
        </li>



        <li ng-controller="tableMenuController"><a href="#/about">Tables</a></li>
        <li><a href="#/about"></a></li>
        <li class="dropdown">
                        <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="true">Hi {{currentUser.name}}</a>
                        <ul class="dropdown-menu" role="menu">
                            <li>
                                <a href="https://app.sea-watch.org/admin/public/auth/logout"><i class="fa fa-sign-out"></i> Logout</a>
                            </li>
                        </ul>
        </li>
      </ul>
</nav>
</div>
  <br/>
 
  <div ng-view id="ngView"></div>
  </div>
</body>
</html>
