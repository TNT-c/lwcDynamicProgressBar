import { LightningElement, wire, api, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { getPicklistValuesByRecordType } from "lightning/uiObjectInfoApi";
import CASE_OBJECT from "@salesforce/schema/Case";

const FIELDS = ["Case.CaseNumber", "Case.Status", "Case.RecordTypeId"];

export default class DynamicProgressBar extends LightningElement {
    @api recordId;

    @track record;
    
    @api statusModel;
    
    @track currentStatus;
    
    @track currentStep;
    
    @api caseStatuses;
    
    error;
    
    // wire method to retrieve record data
    @wire(getRecord, { recordId: "$recordId", fields: FIELDS })
    csRecord({ data, error }) {
      if (data) {
        this.record = data;
        this.currentStatus = this.record.fields.Status.value;
        if (this.caseStatuses){
          // invoke buildValuesModel and pass in parameters
          this.buildValuesModel(
          this.caseStatuses,
          this.currentStatus
        );
        }
      } else if (error) {
        this.error = error;
      }
    }
    
    // wire method to retrieve picklist values
    @wire(getPicklistValuesByRecordType, {
        objectApiName: CASE_OBJECT,
        recordTypeId: "$record.fields.RecordTypeId.value"
      })
      wiredValues({ data, error }) {
        if (data) {
          this.caseStatuses = data.picklistFieldValues;
          // invoke buildValuesModel and pass in parameters
          this.buildValuesModel(
            this.caseStatuses,
            this.currentStatus
          );
          this.error = undefined;
          //     this.treeModel = this.buildTreeModel(data.picklistFieldValues);
        } else {
          this.error = error;
          //    this.treeModel = undefined;
        }
      }

    buildValuesModel(picklistValues, valueKey) {
        let map = new Map();
        this.statusModel = picklistValues["Status"].values.map((item, index) => ({
          label: item.label,
          name: "step-" + (index + 1)
        }));
        // populate map key-value pair data 
        Object.keys(this.statusModel).forEach(ele => {
          map.set(this.statusModel[ele].label, this.statusModel[ele].name);
        });
        // store current step to be used in front end
        this.currentStep = map.get(valueKey);
        console.log(map);
      }

      
    get csNumber() {
    return this.record.fields.CaseNumber.value;
    }

    get csStatus() {
    return this.record.fields.Status.value;
    }

    get csRecordTypeId() {
    return this.record.fields.RecordTypeId.value;
    }
}