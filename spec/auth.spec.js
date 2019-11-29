require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;
var cookie = ""
var testusername = "abcde"
describe('Validate auth.js ', () => {


	it('should log in user', (done) => {
	    let loginpost = {"username":testusername,"password":"bbb"}
		fetch(url('/login'),{
		method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(loginpost)
		}).then(function(response) {
            expect(response.status).toBe(200);
            cookie = response.headers._headers['set-cookie']
            //console.log(cookie)
            return response.json()
           }).then(function(response){
               expect(response.result).toBe('success')   
               expect(response.username).toBe(testusername)  
               
                done();
            })
        
	})
        it('should log out current logged in user',(done) => {
        let loginpost = {"username":testusername,"password":"bbb"}
        fetch(url('/login'),{
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(loginpost)
        }).then(function(){
        fetch(url('/logout'),{
        method: 'PUT',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json'},
        body: ""}).then(function(response){
            expect(response.status).toBe(200);
            done();    
        })
        })   



})


});