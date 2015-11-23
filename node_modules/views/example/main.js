/* global views */
'use strict';
views.debug(false)
console.log(views)
let Collection = views.Collection.extend({
	comparator: 'title'
})
let collection = new Collection([{title:'title9', id:1},{title:'title2', id:2}]);

let view = new views.CollectionView({
	sort: true,
	collection: collection,
	childViewOptions: {
		template: function (data) {
			return data.title + " - id:" + data.id
		}
	}
});

var count = 2
function add (collection,index) {
	collection.add({title: 'title' + (++count), id: count}, {at:index})
	//console.log(collection.toJSON())
}

function remove (collection,model) {
	collection.remove(model)
	//console.log(collection.toJSON())
}

view.render().appendTo('body')

setTimeout(function () {
	add(collection)
	
}, 1000);

setTimeout(function () {
	remove(collection, collection.models[1])
	
}, 1500);

setTimeout(function () {
	add(collection, 0)
	
}, 2000);