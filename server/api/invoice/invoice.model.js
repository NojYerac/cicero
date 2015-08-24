'use strict';

var _ = require('lodash'),
  async = require('async'),
  mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var Project = require('../project/project.model')

var LineItemSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  note: String,
  projectId: {
    type: ObjectId,
    ref: 'Project'
  },
  units: {
    type: String,
    default: 'Hour'
  },
  quantity: {
    type: Number,
    default: 1
  },
  rate: {
    type: Number,
    required: true
  },
  times: [{
    type: ObjectId,
    ref: 'Time'
  }]
});

LineItemSchema.methods = {
  populateFromProject: function() {
    return new Promise(function(resolve, reject) {
      if (!this.projectId) return resolve(this);
      var lineItem = this;
      Project.findById(lineItem.projectId, function(error, project) {
        if (error) return reject(error);
        _.extend(lineItem, {
          name: project.name,
          note: project.note,
          units: 'Hour',
          rate: project.rate
        });
        resolve(lineItem);
      });
    }.bind(this));
  }
};

var LineItem = mongoose.model('LineItem', LineItemSchema)

var InvoiceSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  clientId: {
    type: ObjectId,
    ref: 'Client',
    required: true
  },
  timeLineItems: [LineItemSchema],
  customLineItems: [LineItemSchema],
  issueDate: {
    type: Date,
    default: (new Date())
  },
  dueDate: {
    type: Date,
    required: true
  },
  terms: {
    type: String,
    default: 'NET 30'
  },
  calc: {
    closestMin: {
      type: Number,
      min: 1,
      max: 60,
      default: 15
    },
    roundingMethod: {
      type: String,
      enum: ['FLOOR', 'CEIL', 'ROUND'],
      default: 'ROUND'
    }
  },
  times: [{
    type: ObjectId,
    ref: 'Time'
  }]
});

InvoiceSchema
  .virtual('rounder')
  .get(function() {
    var closestMin = this.calc.closestMin;
    var method = {
      'FLOOR': Math.floor,
      'CEIL': Math.ceil,
      'ROUND': Math.round
    }[this.calc.roundingMethod] || Math.round;
    /**
     * Dynamic rounding method
     * @param  {Number} total total time elapsed in miliseconds
     * @return {Number}       total time rounded based on invoice.calc
     */
    return function(total) {
      var interval = closestMin * 60 * 1000;
      var count = total / interval
      return interval * method(count);
    }
  });


InvoiceSchema.methods = {
  /**
   * Get times in this invoice
   * @return {Promise} [description]
   */
  getTimesAsync: function() {
    var invoice = this;
    return new Promise(function(resolve, reject) {
      invoice.populate('times', function(error, timeDocs) {
        if (error) return reject(error);
        resolve(timeDocs);
      });
    });
  },
  /**
   * Set times for this invoice
   * @param  {Array} times [description]
   * @return {Promise}       [description]
   */
  setTimesAsync: function(times) {
      var invoice = this;
      return new Promise(function(resolve, reject) {
        invoice.timeLineItems = []
        invoice.times = times;
        var rounder = invoice.rounder;
        invoice.populate('times', function(error, populatedInvoice) {
          if (error) return reject(error);
          var timeDocs = populatedInvoice.times;
          // sort times by projectId
          var projectsById = {};
          timeDocs.forEach(function(timeDoc, index) {
            projectsById[timeDoc.projectId] = projectsById[timeDoc.projectId] || [];
            projectsById[timeDoc.projectId].push(timeDoc);
          });
          // create a lineItem for each project
          var asyncFuncs = [];
          /**
           * Queues up a function to convert a series of times to a line item
           * @param  {Project} projectTimes [description]
           * @param  {String} projectId    [description]
           */
          function projectTimes2lineItem(projectTimes, projectId) {
            asyncFuncs.push(
              /**
               * Converts a series of times to a line item
               * @param  {Function} cb callback
               */
              function(cb) {
                var sum = 0;
                projectTimes.forEach(function(time, index) {
                  sum += (time.endTime - time.startTime);
                });
                sum = rounder(sum);
                var lineItem = new LineItem({
                  projectId: projectId,
                  times: _.map(projectTimes, '_id'),
                  quantity: (sum / (60 * 60 * 1000))
                });
                lineItem.populateFromProject()
                  .then(function(lI) {
                    invoice.timeLineItems.push(lI);
                    cb();
                  })
                  .catch(function(error) {
                    cb(error);
                  });
              });
          }
          // queue up conversion functions
          _.forEach(projectsById, projectTimes2lineItem);
          // execute the queued functions
          async.parallel(asyncFuncs, function(error) {
            if (error) return reject(error);
            resolve(invoice);
          }); // end async.parallel
        }); // end invoice.populate
      }); // end Promise
    } // end setTimesAsync
}; // end InvoiceSchema.methods

module.exports = mongoose.model('Invoice', InvoiceSchema);
