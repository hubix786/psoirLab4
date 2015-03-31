var util = require("util");
var helpers = require("../helpers");
var Policy = require("../s3post").Policy;
var S3Form = require("../s3post").S3Form;
var AWS_CONFIG_FILE = "config.json";
var POLICY_FILE = "policy.json";
var INDEX_TEMPLATE = "index.ejs";
var AWS = require("aws-sdk");
AWS.config.loadFromPath(AWS_CONFIG_FILE);

var task = function(request, callback){
	var success;
	if(request.query.key) {
		var s3 = new AWS.S3();
		success = {
			filename: request.query.key,
			etag: request.query.etag,
			bucket: request.query.bucket,
			url: s3.getSignedUrl('getObject', {Bucket: request.query.bucket, Key: request.query.key,Expires:60})
		};
		
	}
	//1. load configuration
	var awsConfig = helpers.readJSONFile(AWS_CONFIG_FILE);
	var policyData = helpers.readJSONFile(POLICY_FILE);

	//2. prepare policy
	var policy = new Policy(policyData);

	//3. generate form fields for S3 POST
	var s3Form = new S3Form(policy);
	//4. get bucket name
	var bucket = policy.getConditionValueByKey("bucket");
	//5. get hidden fields and credentials
	var fields = s3Form.addS3CredientalsFields(s3Form.generateS3FormFields(),awsConfig);
	
	callback(null, {template: INDEX_TEMPLATE, params:{fields:fields, bucket:bucket, success: success}});
}

exports.action = task;
