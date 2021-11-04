<?php

class HttpSqlJson{
	
	function __construct($dsn,$usr,$pwd){
		$this->pdo = new PDO($dsn, $usr, $pwd, array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8") );
	}
	
	function getParamsFor($sp){
		$stmt = $this->pdo->prepare('CALL params(?)');
		$stmt -> execute(array($sp));
		$params = $stmt -> fetchAll(PDO::FETCH_COLUMN);
		return $params;
	}
	
	function query($extractcaption=false){ //,

		//$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		//$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
		
		$method=strtoupper($_SERVER['REQUEST_METHOD']);
		$sp=preg_split('/&/',$_SERVER['QUERY_STRING'],2)[0];
		$args=json_decode(file_get_contents("php://input"));//$_SERVER["CONTENT_TYPE"]
		
		
		if(!$sp)
		switch($method){
			case 'GET':
			case 'PUT':
				$sp=key($_GET);
				break;
			case 'POST':
			case 'DELETE':
			default:
				$sp=join('',array_keys($_GET));
		}

		$sp=$method.'.'.$sp;
		
		$params=Array();
		
		foreach($this->getParamsFor($sp) as $key){
			$k= substr($key,1);
			$v= $_REQUEST[$k] ? $_REQUEST[$k] : $args->$k;
			$params[':'.$key]=is_object($v)?json_encode($v):$v;//$_REQUEST[substr($key,1)];//
		}
		
		if(!check_auth($params[':author']))
			die("401 check auth error");
/*			
		print_r($params);
*/		
		$keys=join(',',array_keys($params));
		
		$stmt=$this->pdo->prepare("CALL `$sp`($keys)");//
		
		if(!$stmt->execute($params))
			die($stmt->errorInfo()[2]);
		
		$singlerow=($sp{-1}=='#');
		
		header("Content-Type:application/json;charset=utf-8");
		custom_json($stmt,$singlerow);
		unset($stmt);
			
	}
}

function custom_json($stmt,$singlerow=false){
	
	$columns=[];
	$types=[];
	$count=$stmt->columnCount();
			
	for($i=0;$i<$count;$i++){
		$meta=$stmt->getColumnMeta($i);
		$columns[$i]=$meta['name'];
		$types[$i]=$meta['native_type'];
	}
	
	if($singlerow){
	}else{
		echo"[\n";
		$fr=true;
		while($row=$stmt->fetch(PDO::FETCH_NUM)){//
			if($fr)$fr=false; else echo',';
			echo'{';
			$fc=true;
			for($i=0;$i<$count;$i++)
				if($value=$row[$i]){
					if($fc)$fc=false; else echo',';
					echo"\"$columns[$i]\":";
					switch($types[$i]){
						case'':
						case'JSON':
						case'INTEGER':
						case'LONG':
						case'INT':
						case'FLOAT':
							echo $value; break;
						default:
							echo '"'.slashquote($value).'"';//addslashes()
					}
				}
			echo"}\n";
		}
		echo"]";
	}
}

function slashquote($str){
	return preg_replace('/\n|\r/','\n',preg_replace('/"/','\"',$str));
}

function check_auth( $author ){
	
	if($author==null)
		return true; // no authentity required
	
	
	if (!isset($_SERVER['PHP_AUTH_USER'])) {
	    header('WWW-Authenticate: Basic realm="My Realm"');
	    header('HTTP/1.0 401 Unauthorized');
	    exit;
	} else if($author==$_SERVER['PHP_AUTH_USER']){
		
		$params=[
			'author'=>$author,
			'key'=>$_SERVER['PHP_AUTH_PW']
		];
		
		$stmt=$this->pdo->prepare("CALL auth(:author,:key)");
		
		if(!$stmt->execute($params))
			die($stmt->errorInfo()[2]);
		
		$success=$stmt->fetch(PDO::FETCH_NUM);
		print_r($success);
		
	}	
	
}