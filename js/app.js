/*global jQuery, Handlebars, Router */
jQuery(function ($) {
	'use strict';

	Handlebars.registerHelper('eq', function (a, b, options) {
		return a === b ? options.fn(this) : options.inverse(this);
	});

	var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

	var util = {
		uuid: function () {
			/*jshint bitwise:false */
			var i, random;
			var uuid = '';

			for (i = 0; i < 32; i++) {
				random = Math.random() * 16 | 0;
				if (i === 8 || i === 12 || i === 16 || i === 20) {
					uuid += '-';
				}
				uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
			}

			return uuid;
		},
		pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
		store: function (namespace, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(namespace, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(namespace);
				return (store && JSON.parse(store)) || [];
			}
		}
	};

	var App = {
		init: function () {
			// To set up shopping list array in localStorage.
			this.shoppingList = util.store('shoppingList');
			// to set up template compile functions.
			this.listTemplate = Handlebars.compile($('.list-template').html());
			this.stickyFooterTemplate = Handlebars.compile($('#sticky-footer-template').html());
			this.sproutsFooterTemplate = Handlebars.compile($('#sprouts-footer-template').html());
			this.tjsFooterTemplate = Handlebars.compile($('#tjs-footer-template').html());
			this.walmartFooterTemplate = Handlebars.compile($('#walmart-footer-template').html());
			this.miscFooterTemplate = Handlebars.compile($('#misc-footer-template').html());

			this.bindEvents();

			new Router({
				'/:filter': function (filter) {
					this.filter = filter;
					this.render();
				}.bind(this)
			}).init('/all');
		},
		bindEvents: function () {
			$('.new-item').on('keyup', this.create.bind(this));
			// $('#toggle-all').on('change', this.toggleAll.bind(this));
			// $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
			$('.items')
				.on('change', '.toggle', this.toggle.bind(this))
			// 	.on('dblclick', 'label', this.editingMode.bind(this))
			// 	.on('keyup', '.edit', this.editKeyup.bind(this))
			// 	.on('focusout', '.edit', this.update.bind(this))
			// 	.on('click', '.destroy', this.destroy.bind(this));
		},
		render: function () {
			var stickyItems = this.stickyItems;
			var sproutsList = this.sproutsList;
			var tjsList = this.tjsList;
			var walmartList = this.walmartList;
			var miscList = this.miscList;
			$('#sticky-ul').html(this.listTemplate(stickyItems.filter));
			$('#sprouts-ul').html(this.listTemplate(sproutsList.filter));
			$('#traderJoes-ul').html(this.listTemplate(tjsList.filter));
			$('#walmart-ul').html(this.listTemplate(walmartList.filter));
			$('#misc-ul').html(this.listTemplate(miscList.filter));
			// $('.main').toggle(todos.length > 0);
			// $('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			this.renderFooter();
			// $('.new-item').focus();
			console.log(this.shoppingList);
			util.store('shoppingList', this.shoppingList);
		},
		renderFooter: function () {
			var shoppingList = this.shoppingList.length;
			// var activeTodoCount = this.getActiveTodos().length;
			var stickyTemplate = this.stickyFooterTemplate({
				// activeTodoCount: activeTodoCount,
				// activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				// completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			var sproutsTemplate = this.sproutsFooterTemplate({
				// activeTodoCount: activeTodoCount,
				// activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				// completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			var tjsTemplate = this.tjsFooterTemplate({
				// activeTodoCount: activeTodoCount,
				// activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				// completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			var walmartTemplate = this.walmartFooterTemplate({
				// activeTodoCount: activeTodoCount,
				// activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				// completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			var miscTemplate = this.walmartFooterTemplate({
				// activeTodoCount: activeTodoCount,
				// activeTodoWord: util.pluralize(activeTodoCount, 'item'),
				// completedTodos: todoCount - activeTodoCount,
				filter: this.filter
			});

			$('#sticky-footer').toggle(shoppingList > 0).html(stickyTemplate);
			$('#sprouts-footer').toggle(shoppingList > 0).html(sproutsTemplate);
			$('#tjs-footer').toggle(shoppingList > 0).html(tjsTemplate);
			$('#walmart-footer').toggle(shoppingList > 0).html(walmartTemplate);
			$('#misc-footer').toggle(shoppingList > 0).html(miscTemplate);
		},
		// toggleAll: function (e) {
		// 	var isChecked = $(e.target).prop('checked');

		// 	this.todos.forEach(function (todo) {
		// 		todo.completed = isChecked;
		// 	});

		// 	this.render();
		// },
		// getActiveTodos: function () {
		// 	return this.todos.filter(function (todo) {
		// 		return !todo.completed;
		// 	});
		// },
		// getCompletedTodos: function () {
		// 	return this.todos.filter(function (todo) {
		// 		return todo.completed;
		// 	});
		// },

		
		stickyItems: {
			filter: function () {
				
				return {title: 'test123'};
			}

			
		},
		sproutsList: {
			filter: function () {
				if (App.filter === 'sprouts-items-left') {
					var items = App.sproutsList.sproutsItems();

					return items.filter(function (item) {
						return !item.completed;
					});
				}

				if (App.filter === 'sprouts-items-acquired') {
					var items = App.sproutsList.sproutsItems();
					
					return items.filter(function (item) {
						return item.completed;
					});
				}

				return App.sproutsList.sproutsItems();
			},
			sproutsItems: function () {
				return App.shoppingList.filter(function (item) {
					return item.list === 'sprouts-list';
				});
			}
		},
		tjsList: {
			filter: function () {
				if (App.filter === 'tjs-items-left') {
					var items = App.tjsList.tjsItems();

					return items.filter(function (item) {
						return !item.completed;
					});
				}

				if (App.filter === 'tjs-items-acquired') {
					var items = App.tjsList.tjsItems();
					
					return items.filter(function (item) {
						return item.completed;
					});
				}

				return App.tjsList.tjsItems();
			},
			tjsItems: function () {
				return App.shoppingList.filter(function (item) {
					return item.list === 'trader-joes-list';
				});
			}
		},
		walmartList: {
			filter: function () {
				if (App.filter === 'walmart-items-left') {
					var items = App.walmartList.walmartItems();

					return items.filter(function (item) {
						return !item.completed;
					});
				}

				if (App.filter === 'walmart-items-acquired') {
					var items = App.walmartList.walmartItems();
					
					return items.filter(function (item) {
						return item.completed;
					});
				}

				return App.walmartList.walmartItems();
			},
			walmartItems: function () {
				return App.shoppingList.filter(function (item) {
					return item.list === 'walmart-list';
				});
			}
		},
		miscList: {
			filter: function () {
				if (App.filter === 'misc-items-left') {
					var items = App.miscList.miscItems();

					return items.filter(function (item) {
						return !item.completed;
					});
				}

				if (App.filter === 'misc-items-acquired') {
					var items = App.miscList.miscItems();
					
					return items.filter(function (item) {
						return item.completed;
					});
				}

				return App.miscList.miscItems();
			},
			miscItems: function () {
				return App.shoppingList.filter(function (item) {
					return item.list === 'misc-list';
				});
			}
		},
		getFilteredWalmartList: function () {
			if (this.filter === 'active') {
				return;
			}

			if (this.filter === 'completed') {
				return;
			}

			return this.todos;
		},
		getFilteredMiscList: function () {
			if (this.filter === 'active') {
				return;
			}

			if (this.filter === 'completed') {
				return;
			}

			return this.todos;
		}, 


		// destroyCompleted: function () {
		// 	this.todos = this.getActiveTodos();
		// 	this.filter = 'all';
		// 	this.render();
		// },
		// // accepts an element from inside the `.item` div and
		// // returns the corresponding index in the `todos` array
		getIndexFromEl: function (el) {
			var id = $(el).closest('li').data('id');
			var shoppingList = this.shoppingList;
			var i = shoppingList.length;

			while (i--) {
				if (shoppingList[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var $input = $(e.target);
			var val = $input.val().trim();
			var whatList = e.target.offsetParent.id;

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.shoppingList.push({
				id: util.uuid(),
		        list: whatList,
				title: val,
				completed: false
			});

			$input.val('');

			this.render();
		},
		toggle: function (e) {
			var i = this.getIndexFromEl(e.target);
			this.shoppingList[i].completed = !this.shoppingList[i].completed;
			this.render();
		}
		// editingMode: function (e) {
		// 	var $input = $(e.target).closest('li').addClass('editing').find('.edit');
		// 	$input.val($input.val()).focus();
		// },
		// editKeyup: function (e) {
		// 	if (e.which === ENTER_KEY) {
		// 		e.target.blur();
		// 	}

		// 	if (e.which === ESCAPE_KEY) {
		// 		$(e.target).data('abort', true).blur();
		// 	}
		// },
		// update: function (e) {
		// 	var el = e.target;
		// 	var $el = $(el);
		// 	var val = $el.val().trim();

		// 	if (!val) {
		// 		this.destroy(e);
		// 		return;
		// 	}

		// 	if ($el.data('abort')) {
		// 		$el.data('abort', false);
		// 	} else {
		// 		this.todos[this.getIndexFromEl(el)].title = val;
		// 	}

		// 	this.render();
		// },
		// destroy: function (e) {
		// 	this.todos.splice(this.getIndexFromEl(e.target), 1);
		// 	this.render();
		// }
	};

	App.init();
});


// Notes;
// - need to complete stilcy items 
// each list now has it's own footer template.
// need to test functionality 
//  - add rest of existing methods
//  - going to need snapshot...