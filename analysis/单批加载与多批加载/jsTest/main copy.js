class Pack{
    constructor(id){
        this.id=id
        this.size=-1
        this.vd=-1
        this.time0=-1
        this.time1=-1
        this.time2=-1
    }
    request(cb){
        this.time0=performance.now()
        this.send(cb)
    }
    send(cb){
        const self=this
        const delay=950
        new Promise( ( resolve, reject )=> {
            setTimeout(()=>{
               resolve("finish") 
            },delay)
		} ).then(  () => {
            self.time1=performance.now()
            // setTimeout(()=>{
                self.parse(cb)
            // })
		} )
    }
    parse(cb){
        const self=this
        const workload=1000*1000*100
        new Promise( ( resolve, reject )=> {
            let n
            for(let i=0;i<workload;i++)n=Math.pow(2,workload)+n
            resolve("finish",n) 
		} ).then(  () => {
            self.time2=performance.now()
			if(cb)cb(self)
		} )
    }
}
class PackList{
    constructor(pack_num){
        this.pack_num=pack_num
        this.list=[]
        for(let i=0;i<pack_num;i++)
            this.list.push(new Pack(i))
        const self=this
        window.getTimeList=()=>{
            const d=self.getTimeList()
            self.saveJson(d,"result.json")
        }
    }
    getPack(i){return this.list[i]}
    start(i,cb){this.list[i].request(cb)}
    getTimeList(){
        const config={}
        for(let id=0;id<this.pack_num;id++){
            const pack=this.getPack(id)
            config[id]={
                "request":  pack.time0,
                "loaded":   pack.time1,
                "forwarded":pack.time1,
                "parsed":   pack.time2
            }
        }
        return config
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data)
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
}
class Simulate{
    constructor(){
        this.pack_num=529
        const loadingNum=250
        this.packList=new PackList(this.pack_num)
        let parsedNum=0
        for(let i=0;i<loadingNum;i++){
            this.packList.start(i,pack=>{
                parsedNum++
                console.log(parsedNum,pack.id)
                if(parsedNum==loadingNum){window.getTimeList()}
            })
        }
    }
}
new Simulate()