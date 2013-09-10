exports.log = log;
function log(s, a) 
{
  if (!s || !a) return;
	var myName = a.callee.toString();
	myName = myName.substr('function '.length);
	myName = myName.substr(0, myName.indexOf('('));

	console.log(myName+'() says:', s);

}