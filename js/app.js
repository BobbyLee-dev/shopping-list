/*global jQuery, Handlebars, Router test */
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
			$('#toggle-all-sticky').on('change', this.toggleAll.sticky.bind(this));
			$('#toggle-all-sprouts').on('change', this.toggleAll.sprouts.bind(this));
			$('#toggle-all-tjs').on('change', this.toggleAll.tjs.bind(this));
			$('#toggle-all-walmart').on('change', this.toggleAll.walmart.bind(this));
			$('#toggle-all-misc').on('change', this.toggleAll.misc.bind(this));
			// $('#footer').on('click', '#clear-completed', this.destroyCompleted.bind(this));
			$('.items')
				.on('change', '.toggle', this.toggle.bind(this))
				.on('dblclick', 'label', this.editingMode.bind(this))
				.on('keyup', '.edit', this.editKeyup.bind(this))
				.on('focusout', '.edit', this.update.bind(this))
				.on('click', '.destroy', this.destroy.bind(this));
		},
		render: function () {
			var stickyList = this.stickyList;
			var sproutsList = this.sproutsList;
			var tjsList = this.tjsList;
			var walmartList = this.walmartList;
			var miscList = this.miscList;
			$('#sticky-ul').html(this.listTemplate(stickyList.filter()));
			$('#sprouts-ul').html(this.listTemplate(sproutsList.filter));
			$('#traderJoes-ul').html(this.listTemplate(tjsList.filter));
			$('#walmart-ul').html(this.listTemplate(walmartList.filter));
			$('#misc-ul').html(this.listTemplate(miscList.filter));
			// $('main').toggle(todos.length > 0);

			// this sets the checked prop of toggle all when all todos are selected manually
			// $('#toggle-all').prop('checked', this.getActiveTodos().length === 0);
			$('#toggle-all-sticky').prop('checked', this.stickyList.itemsNeeded().length === 0);
			$('#toggle-all-sprouts').prop('checked', this.sproutsList.itemsNeeded().length === 0);
			$('#toggle-all-tjs').prop('checked', this.tjsList.itemsNeeded().length === 0);
			$('#toggle-all-walmart').prop('checked', this.walmartList.itemsNeeded().length === 0);
			$('#toggle-all-misc').prop('checked', this.miscList.itemsNeeded().length === 0);
			this.renderFooter();
			
			util.store('shoppingList', this.shoppingList);

			
		},
		// test to grab items when whatList can be any list
		// items: function (whatList) {
		// 	var test = [];
		// 	for(var i = 0; i < this.shoppingList.length; i++) {
		// 		if (this.shoppingList[i].list == whatList) {
		// 			test.push(this.shoppingList[i]);
		// 		}
		// 	}
		// 	return test;
		// },
		renderFooter: function () {
			var shoppingList = this.shoppingList.length;
			// var activeTodoCount = this.getActiveTodos().length;
			var stickyTemplate = this.stickyFooterTemplate({
				activeTodoCount: this.stickyList.filter().length,
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

			var miscTemplate = this.miscFooterTemplate({
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
		// toggleAll object holds all toggleAll methods for each list
		toggleAll: {
			sticky: function (e) {
				var isChecked = $(e.target).prop('checked');

				this.stickyList.filter().forEach(function (item) {
					item.completed = isChecked;
				});

				this.render();
			},
			sprouts: function (e) {
				var isChecked = $(e.target).prop('checked');

				this.sproutsList.sproutsItems().forEach(function (item) {
					item.completed = isChecked;
				});

				this.render();
			},
			tjs: function (e) {
				var isChecked = $(e.target).prop('checked');

				this.tjsList.tjsItems().forEach(function (item) {
					item.completed = isChecked;
				});

				this.render();
			},
			walmart: function (e) {
				var isChecked = $(e.target).prop('checked');

				this.walmartList.walmartItems().forEach(function (item) {
					item.completed = isChecked;
				});

				this.render();
			},
			misc: function (e) {
				var isChecked = $(e.target).prop('checked');

				this.miscList.miscItems().forEach(function (item) {
					item.completed = isChecked;
				});

				this.render();
			},
		},
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

		
		stickyList: {
			filter: function () {
				if (App.filter === 'sticky-items-left') {
					
					this.itemsNeeded();
				}

				if (App.filter === 'sticky-items-acquired') {
					var items = App.stickyList.stickyItems();
					
					return items.filter(function (item) {
						return item.completed;
					});
				}

				return App.stickyList.stickyItems();
			},
			stickyItems: function () {
				return App.shoppingList.filter(function (item) {
					return item.list === 'sticky-items';
				});
			},
			itemsNeeded: function () {
				var items = App.stickyList.stickyItems();

				return items.filter(function (item) {
					return !item.completed;
				});
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
			},
			itemsNeeded: function () {
				var items = App.sproutsList.sproutsItems();

				return items.filter(function (item) {
					return !item.completed;
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
			},
			itemsNeeded: function () {
				var items = App.tjsList.tjsItems();

				return items.filter(function (item) {
					return !item.completed;
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
			},
			itemsNeeded: function () {
				var items = App.walmartList.walmartItems();

				return items.filter(function (item) {
					return !item.completed;
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
			},
			itemsNeeded: function () {
				var items = App.miscList.miscItems();

				return items.filter(function (item) {
					return !item.completed;
				});
			}
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
		},
		editingMode: function (e) {
			var $input = $(e.target).closest('li').addClass('editing').find('.edit');
			$input.val($input.val()).focus();
		},
		editKeyup: function (e) {
			if (e.which === ENTER_KEY) {
				e.target.blur();
			}

			if (e.which === ESCAPE_KEY) {
				$(e.target).data('abort', true).blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var $el = $(el);
			var val = $el.val().trim();

			if (!val) {
				this.destroy(e);
				return;
			}

			if ($el.data('abort')) {
				$el.data('abort', false);
			} else {
				this.shoppingList[this.getIndexFromEl(el)].title = val;
			}

			this.render();
		},
		destroy: function (e) {
			this.shoppingList.splice(this.getIndexFromEl(e.target), 1);
			this.render();
		}
	};

	App.init();
});



// implment clear completed - deystroyCompleted functionality on all lists.
// finish implementing footer templates.

// - move footer/filters to top 
// - toggle list when empty, look a commented out render lines

// - snapshot

// - start brain storming how lists/stores could be added dynamiclly - create methods etc.