class APIFeatures{
    constructor(query,queryString){
        this.query=query;
        this.queryString = queryString;
    }
    
    filter(){
        const queryObj = {...this.queryString};
        const excludeField = ['sort','fields'];
        excludeField.forEach(el =>  delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

        this.query.find(JSON.parse(queryStr));
        
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }
        return this;
    }
    fieldLimiting(){
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            // this.query= this.query.select('fields');
            this.query = this.query.select(fields);

        }else{
            this.query= this.query.select('-__v');
        }
        return this;
    }
    
}

export default APIFeatures;