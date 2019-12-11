
const Domain = 	"http://localhost:9081/v1/";
function get(uri: string): any {
    let req: any = {
        method:'GET',
        headers:{
            'Content-Type':'application/json;charset=UTF-8'
        },
        mode:'cors',
        cache:'default'
    }
    return fetch(Domain + uri, req)
        .then(res => res.json())
        .catch(err => console.error("fetch get error", err));
}

export default get;