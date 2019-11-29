require('es6-promise').polyfill();
require('isomorphic-fetch');

const url = path => `http://localhost:3000${path}`;
var cookie = ""
var testusername = "abcde"
var previousnumber = 0
describe('Validate articles.js ', () => {


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
    
    it(' return at least 5 articles if test user is logged in user',(done) => { 
        fetch(url('/articles'),{
        method: 'GET',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
        //body: JSON.stringify(putpost)
        }).then(function(response) {
            expect(response.status).toBe(200);
            return response.json()
           }).then(function(response){
                //console.log(response)
               expect(response.length).toBeGreaterThan(4)  
               previousnumber = response.length
               for(var i=0;i<response.length;i++) 
                  expect(response[i].author).toBe(testusername)  
               
                done();
            })
        })
        it('/articles/id where id is a valid or invalid article id',(done) => {
     
       // let loginpost = {"username":"abc","password":"ccc"}
        fetch(url('/articles/'+12),{
        method: 'GET',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
        //body: JSON.stringify(loginpost)
        }).then(function(response) {
            expect(response.status).toBe(200);
            return response.json()
           }).then(function(response){
                expect(response[0].id).toBe(12)    
                done();
            })
        fetch(url('/articles/'+999),{
        method: 'GET',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
        //body: JSON.stringify(loginpost)
        }).then(function(response) {
            expect(response.status).toBe(200);
            return response.json()
           }).then(function(response){
                expect(response.length).toBe(0)    
                done();
            })

})
    it('POST /article adding an article for logged in user returns list of articles with new article, validate list increased by one and contents of the new article',(done) => { 
        post = { text: "newarticle" }
        fetch(url('/article'),{
        method: 'POST',
        credentials: 'include',
        headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
        body: JSON.stringify(post)
        }).then(function(response) {
            expect(response.status).toBe(200);
            return response.json()
           }).then(function(){ 
              fetch(url('/articles'),{
              method: 'GET',
              credentials: 'include',
              headers: { 'Cookie' : cookie,'Content-Type': 'application/json' },
              //body: JSON.stringify(putpost)
              }).then(function(response) {
                  expect(response.status).toBe(200);
                  return response.json()
                  }).then(function(response){
                    //console.log(response)
                    expect(response.length).toBe(previousnumber+1)
                    expect(response[previousnumber].author).toBe(testusername)  
                    expect(response[previousnumber].body).toBe("newarticle")
                    done();  
                    
               
                    })
           
            })
        })
})