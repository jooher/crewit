<?
$dir='content/';
$data=file_get_contents("php://input");

if(substr($data,0,23)=='data:image/jpeg;base64,'){
	do $name = uniqid().'.jpg'; while(file_exists($dir.$name));
	file_put_contents($dir.$name, base64_decode(substr($data,23)));
	echo $name;
}
else echo substr($data,0,23);
?>