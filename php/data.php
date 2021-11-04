<?
$dsn='mysql:host=mysql101.1gb.ru;dbname=gb_luntik';
$usr='gb_luntik';
$pwd='DD-EjurMSzuU';

require('HttpSqlJson.php');
(new HttpSqlJson($dsn,$usr,$pwd))->query();
?>