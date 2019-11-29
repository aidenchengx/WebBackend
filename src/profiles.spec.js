require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;
var cookie = ""
var testusername = "abcde"
describe('Validate profiles.js ', () => {


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
    
    it(' update logged in user headline',(done) => { 
       let putpost = {"headline": "newheadline"}
        fetch(url('/headline'),{
        method: 'PUT',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
        body: JSON.stringify(putpost)
        }).then(function(response) {
            expect(response.status).toBe(200);
            //console.log(cookie)
            return response.json()
           }).then(function(response){
                console.log(response)
               expect(response.headline).toBe('newheadline')   
               expect(response.username).toBe(testusername)  
               
                done();
            })
        })
        it('return headline for logged in user',(done) => {
     
       // let loginpost = {"username":"abc","password":"ccc"}
        fetch(url('/headline'),{
        method: 'GET',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
        //body: JSON.stringify(loginpost)
        }).then(function(response) {
            expect(response.status).toBe(200);
            //console.log(cookie)
            return response.json()
           }).then(function(response){
               expect(response.headline).toBe('newheadline')   
               expect(response.username).toBe(testusername)  
               
                done();
            })



})


});