
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.44.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/MediaQuery.svelte generated by Svelte v3.44.0 */
    const get_default_slot_changes = dirty => ({ matches: dirty & /*matches*/ 1 });
    const get_default_slot_context = ctx => ({ matches: /*matches*/ ctx[0] });

    function create_fragment$5(ctx) {
    	let current;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], get_default_slot_context);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope, matches*/ 9)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[3],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[3])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[3], dirty, get_default_slot_changes),
    						get_default_slot_context
    					);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('MediaQuery', slots, ['default']);
    	let { query } = $$props;
    	let mql;
    	let mqlListener;
    	let wasMounted = false;
    	let matches = false;

    	onMount(() => {
    		$$invalidate(2, wasMounted = true);

    		return () => {
    			removeActiveListener();
    		};
    	});

    	function addNewListener(query) {
    		mql = window.matchMedia(query);
    		mqlListener = v => $$invalidate(0, matches = v.matches);
    		mql.addEventListener('change', mqlListener);
    		$$invalidate(0, matches = mql.matches);
    	}

    	function removeActiveListener() {
    		if (mql && mqlListener) {
    			mql.removeListener(mqlListener);
    		}
    	}

    	const writable_props = ['query'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<MediaQuery> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('$$scope' in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		query,
    		mql,
    		mqlListener,
    		wasMounted,
    		matches,
    		addNewListener,
    		removeActiveListener
    	});

    	$$self.$inject_state = $$props => {
    		if ('query' in $$props) $$invalidate(1, query = $$props.query);
    		if ('mql' in $$props) mql = $$props.mql;
    		if ('mqlListener' in $$props) mqlListener = $$props.mqlListener;
    		if ('wasMounted' in $$props) $$invalidate(2, wasMounted = $$props.wasMounted);
    		if ('matches' in $$props) $$invalidate(0, matches = $$props.matches);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*wasMounted, query*/ 6) {
    			{
    				if (wasMounted) {
    					removeActiveListener();
    					addNewListener(query);
    				}
    			}
    		}
    	};

    	return [matches, query, wasMounted, $$scope, slots];
    }

    class MediaQuery extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { query: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MediaQuery",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*query*/ ctx[1] === undefined && !('query' in props)) {
    			console.warn("<MediaQuery> was created without expected prop 'query'");
    		}
    	}

    	get query() {
    		throw new Error("<MediaQuery>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set query(value) {
    		throw new Error("<MediaQuery>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/Tab.svelte generated by Svelte v3.44.0 */

    const file$3 = "src/Tab.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let span0;
    	let t1;
    	let p;
    	let t2;
    	let t3;
    	let span1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			span0.textContent = "{";
    			t1 = space();
    			p = element("p");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "}";
    			attr_dev(span0, "class", "svelte-1lt9ex6");
    			toggle_class(span0, "hovered", /*hovered*/ ctx[2]);
    			toggle_class(span0, "selected", /*selected*/ ctx[1]);
    			add_location(span0, file$3, 7, 4, 262);
    			attr_dev(p, "class", "svelte-1lt9ex6");
    			add_location(p, file$3, 8, 4, 318);
    			attr_dev(span1, "class", "svelte-1lt9ex6");
    			toggle_class(span1, "hovered", /*hovered*/ ctx[2]);
    			toggle_class(span1, "selected", /*selected*/ ctx[1]);
    			add_location(span1, file$3, 9, 4, 336);
    			attr_dev(div, "class", "svelte-1lt9ex6");
    			add_location(div, file$3, 6, 0, 103);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			append_dev(div, span1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", /*mouseover_handler*/ ctx[4], false, false, false),
    					listen_dev(div, "focus", /*focus_handler*/ ctx[5], false, false, false),
    					listen_dev(div, "mouseout", /*mouseout_handler*/ ctx[6], false, false, false),
    					listen_dev(div, "blur", /*blur_handler*/ ctx[7], false, false, false),
    					listen_dev(div, "click", /*click_handler*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hovered*/ 4) {
    				toggle_class(span0, "hovered", /*hovered*/ ctx[2]);
    			}

    			if (dirty & /*selected*/ 2) {
    				toggle_class(span0, "selected", /*selected*/ ctx[1]);
    			}

    			if (dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);

    			if (dirty & /*hovered*/ 4) {
    				toggle_class(span1, "hovered", /*hovered*/ ctx[2]);
    			}

    			if (dirty & /*selected*/ 2) {
    				toggle_class(span1, "selected", /*selected*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tab', slots, []);
    	let { name = "tab_name" } = $$props;
    	let { selected = false } = $$props;
    	let hovered = false;
    	const writable_props = ['name', 'selected'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tab> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	const mouseover_handler = e => $$invalidate(2, hovered = true);
    	const focus_handler = e => $$invalidate(2, hovered = true);
    	const mouseout_handler = e => $$invalidate(2, hovered = false);
    	const blur_handler = e => $$invalidate(2, hovered = false);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    	};

    	$$self.$capture_state = () => ({ name, selected, hovered });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    		if ('selected' in $$props) $$invalidate(1, selected = $$props.selected);
    		if ('hovered' in $$props) $$invalidate(2, hovered = $$props.hovered);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		name,
    		selected,
    		hovered,
    		click_handler,
    		mouseover_handler,
    		focus_handler,
    		mouseout_handler,
    		blur_handler
    	];
    }

    class Tab extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { name: 0, selected: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tab",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get name() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selected() {
    		throw new Error("<Tab>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selected(value) {
    		throw new Error("<Tab>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TabHeader.svelte generated by Svelte v3.44.0 */
    const file$2 = "src/TabHeader.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	child_ctx[9] = i;
    	return child_ctx;
    }

    // (23:1) {#if matches}
    function create_if_block_1$1(ctx) {
    	let div;
    	let current;
    	let each_value_1 = /*names*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "header-small-screen svelte-8fnty7");
    			add_location(div, file$2, 23, 1, 429);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*names, selectedIndex, handleClick*/ 7) {
    				each_value_1 = /*names*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(23:1) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (25:2) {#each names as name, i}
    function create_each_block_1(ctx) {
    	let tab;
    	let current;

    	function click_handler(...args) {
    		return /*click_handler*/ ctx[3](/*i*/ ctx[9], ...args);
    	}

    	tab = new Tab({
    			props: {
    				name: /*name*/ ctx[7],
    				selected: /*selectedIndex*/ ctx[1] === /*i*/ ctx[9]
    			},
    			$$inline: true
    		});

    	tab.$on("click", click_handler);

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tab_changes = {};
    			if (dirty & /*names*/ 1) tab_changes.name = /*name*/ ctx[7];
    			if (dirty & /*selectedIndex*/ 2) tab_changes.selected = /*selectedIndex*/ ctx[1] === /*i*/ ctx[9];
    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(25:2) {#each names as name, i}",
    		ctx
    	});

    	return block;
    }

    // (22:0) <MediaQuery query="(max-width: 800px)" let:matches>
    function create_default_slot_1$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[6] && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*matches*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1$1.name,
    		type: "slot",
    		source: "(22:0) <MediaQuery query=\\\"(max-width: 800px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (33:1) {#if matches}
    function create_if_block$1(ctx) {
    	let div;
    	let current;
    	let each_value = /*names*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "header-large-screen svelte-8fnty7");
    			add_location(div, file$2, 33, 1, 692);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*names, selectedIndex, handleClick*/ 7) {
    				each_value = /*names*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(33:1) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (35:2) {#each names as name, i}
    function create_each_block(ctx) {
    	let tab;
    	let current;

    	function click_handler_1(...args) {
    		return /*click_handler_1*/ ctx[4](/*i*/ ctx[9], ...args);
    	}

    	tab = new Tab({
    			props: {
    				name: /*name*/ ctx[7],
    				selected: /*selectedIndex*/ ctx[1] === /*i*/ ctx[9]
    			},
    			$$inline: true
    		});

    	tab.$on("click", click_handler_1);

    	const block = {
    		c: function create() {
    			create_component(tab.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(tab, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const tab_changes = {};
    			if (dirty & /*names*/ 1) tab_changes.name = /*name*/ ctx[7];
    			if (dirty & /*selectedIndex*/ 2) tab_changes.selected = /*selectedIndex*/ ctx[1] === /*i*/ ctx[9];
    			tab.$set(tab_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tab.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tab.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tab, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(35:2) {#each names as name, i}",
    		ctx
    	});

    	return block;
    }

    // (32:0) <MediaQuery query="(min-width: 801px)" let:matches>
    function create_default_slot$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[6] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*matches*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(32:0) <MediaQuery query=\\\"(min-width: 801px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let mediaquery0;
    	let t;
    	let mediaquery1;
    	let current;

    	mediaquery0 = new MediaQuery({
    			props: {
    				query: "(max-width: 800px)",
    				$$slots: {
    					default: [
    						create_default_slot_1$1,
    						({ matches }) => ({ 6: matches }),
    						({ matches }) => matches ? 64 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery1 = new MediaQuery({
    			props: {
    				query: "(min-width: 801px)",
    				$$slots: {
    					default: [
    						create_default_slot$1,
    						({ matches }) => ({ 6: matches }),
    						({ matches }) => matches ? 64 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mediaquery0.$$.fragment);
    			t = space();
    			create_component(mediaquery1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(mediaquery0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(mediaquery1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mediaquery0_changes = {};

    			if (dirty & /*$$scope, names, selectedIndex, matches*/ 2115) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, names, selectedIndex, matches*/ 2115) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mediaquery0.$$.fragment, local);
    			transition_in(mediaquery1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mediaquery0.$$.fragment, local);
    			transition_out(mediaquery1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mediaquery0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(mediaquery1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabHeader', slots, []);
    	const dispatch = createEventDispatcher();
    	let { names = ["tab_name"] } = $$props;
    	let selectedIndex = 0;

    	function handleClick(i) {
    		$$invalidate(1, selectedIndex = i);
    		dispatch('select', { selectedIndex: i });
    	}

    	const writable_props = ['names'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabHeader> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (i, event) => handleClick(i);
    	const click_handler_1 = (i, event) => handleClick(i);

    	$$self.$$set = $$props => {
    		if ('names' in $$props) $$invalidate(0, names = $$props.names);
    	};

    	$$self.$capture_state = () => ({
    		MediaQuery,
    		createEventDispatcher,
    		Tab,
    		dispatch,
    		names,
    		selectedIndex,
    		handleClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('names' in $$props) $$invalidate(0, names = $$props.names);
    		if ('selectedIndex' in $$props) $$invalidate(1, selectedIndex = $$props.selectedIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [names, selectedIndex, handleClick, click_handler, click_handler_1];
    }

    class TabHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { names: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabHeader",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get names() {
    		throw new Error("<TabHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set names(value) {
    		throw new Error("<TabHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TabContent.svelte generated by Svelte v3.44.0 */
    const file$1 = "src/TabContent.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let p1;
    	let t1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = space();
    			p1 = element("p");
    			t1 = text(/*readPercentage*/ ctx[3]);
    			attr_dev(p0, "id", "content-para");
    			attr_dev(p0, "class", "svelte-by6zwa");
    			add_location(p0, file$1, 36, 1, 1040);
    			attr_dev(div, "id", "content-container");
    			attr_dev(div, "class", "svelte-by6zwa");
    			add_location(div, file$1, 35, 0, 945);
    			attr_dev(p1, "class", "read-percentage svelte-by6zwa");
    			add_location(p1, file$1, 38, 0, 1112);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			p0.innerHTML = /*content*/ ctx[0];
    			/*p0_binding*/ ctx[5](p0);
    			/*div_binding*/ ctx[6](div);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t1);

    			if (!mounted) {
    				dispose = listen_dev(div, "scroll", /*computeReadPercentage*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*content*/ 1) p0.innerHTML = /*content*/ ctx[0];			if (dirty & /*readPercentage*/ 8) set_data_dev(t1, /*readPercentage*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*p0_binding*/ ctx[5](null);
    			/*div_binding*/ ctx[6](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(p1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabContent', slots, []);
    	let { content = "some content" } = $$props;
    	let contentPara;
    	let contentContainer;
    	let readPercentage = 'All';
    	afterUpdate(() => computeReadPercentage());

    	function computeReadPercentage() {
    		let heightDiff = contentPara.offsetHeight - contentContainer.offsetHeight;

    		if (heightDiff < 0) {
    			// para is shorter than content
    			$$invalidate(3, readPercentage = 'All');
    		} else if (contentContainer.scrollTop == 0) {
    			$$invalidate(3, readPercentage = 'Top');
    		} else if (contentContainer.scrollTop >= heightDiff - 5) {
    			// -5 for mobiles. Read percentage will be 99% or 100% but not 'Bot' even on full
    			// scroll down.
    			$$invalidate(3, readPercentage = 'Bot');
    		} else {
    			$$invalidate(3, readPercentage = Math.round(contentContainer.scrollTop / heightDiff * 100) + '%');
    		}
    	}

    	const writable_props = ['content'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabContent> was created with unknown prop '${key}'`);
    	});

    	function p0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contentPara = $$value;
    			$$invalidate(2, contentPara);
    		});
    	}

    	function div_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			contentContainer = $$value;
    			($$invalidate(1, contentContainer), $$invalidate(0, content));
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		content,
    		contentPara,
    		contentContainer,
    		readPercentage,
    		computeReadPercentage
    	});

    	$$self.$inject_state = $$props => {
    		if ('content' in $$props) $$invalidate(0, content = $$props.content);
    		if ('contentPara' in $$props) $$invalidate(2, contentPara = $$props.contentPara);
    		if ('contentContainer' in $$props) $$invalidate(1, contentContainer = $$props.contentContainer);
    		if ('readPercentage' in $$props) $$invalidate(3, readPercentage = $$props.readPercentage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*content, contentContainer*/ 3) {
    			{

    				if (contentContainer != null) {
    					$$invalidate(1, contentContainer.scrollTop = 0, contentContainer);
    				}
    			}
    		}
    	};

    	return [
    		content,
    		contentContainer,
    		contentPara,
    		readPercentage,
    		computeReadPercentage,
    		p0_binding,
    		div_binding
    	];
    }

    class TabContent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { content: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabContent",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get content() {
    		throw new Error("<TabContent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set content(value) {
    		throw new Error("<TabContent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/TabLayout.svelte generated by Svelte v3.44.0 */
    const file = "src/TabLayout.svelte";

    // (18:1) {#if matches}
    function create_if_block_1(ctx) {
    	let div1;
    	let tabheader;
    	let t0;
    	let tabcontent;
    	let t1;
    	let div0;
    	let a0;
    	let t3;
    	let p0;
    	let t5;
    	let a1;
    	let t7;
    	let p1;
    	let t9;
    	let a2;
    	let current;

    	tabheader = new TabHeader({
    			props: { names: /*tabs*/ ctx[0].map(func) },
    			$$inline: true
    		});

    	tabheader.$on("select", /*handleSelect*/ ctx[2]);

    	tabcontent = new TabContent({
    			props: {
    				content: /*tabs*/ ctx[0][/*selectedIndex*/ ctx[1]].content
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(tabheader.$$.fragment);
    			t0 = space();
    			create_component(tabcontent.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "email";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "·";
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "github";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "·";
    			t9 = space();
    			a2 = element("a");
    			a2.textContent = "linkedin";
    			attr_dev(a0, "href", "mailto://vivekshrikhande444@gmail.com");
    			attr_dev(a0, "rel", "noopener");
    			attr_dev(a0, "class", "svelte-17wp3ml");
    			add_location(a0, file, 22, 3, 607);
    			attr_dev(p0, "class", "svelte-17wp3ml");
    			add_location(p0, file, 23, 3, 683);
    			attr_dev(a1, "href", "https://github.com/vivek-shrikhande");
    			attr_dev(a1, "rel", "noopener");
    			attr_dev(a1, "class", "svelte-17wp3ml");
    			add_location(a1, file, 24, 3, 702);
    			attr_dev(p1, "class", "svelte-17wp3ml");
    			add_location(p1, file, 25, 3, 777);
    			attr_dev(a2, "href", "https://www.linkedin.com/in/vivek-shrikhande");
    			attr_dev(a2, "rel", "noopener");
    			attr_dev(a2, "class", "svelte-17wp3ml");
    			add_location(a2, file, 26, 3, 797);
    			attr_dev(div0, "class", "links svelte-17wp3ml");
    			add_location(div0, file, 21, 2, 584);
    			attr_dev(div1, "class", "tab-layout-small-screen svelte-17wp3ml");
    			add_location(div1, file, 18, 1, 408);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(tabheader, div1, null);
    			append_dev(div1, t0);
    			mount_component(tabcontent, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, a1);
    			append_dev(div0, t7);
    			append_dev(div0, p1);
    			append_dev(div0, t9);
    			append_dev(div0, a2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabheader_changes = {};
    			if (dirty & /*tabs*/ 1) tabheader_changes.names = /*tabs*/ ctx[0].map(func);
    			tabheader.$set(tabheader_changes);
    			const tabcontent_changes = {};
    			if (dirty & /*tabs, selectedIndex*/ 3) tabcontent_changes.content = /*tabs*/ ctx[0][/*selectedIndex*/ ctx[1]].content;
    			tabcontent.$set(tabcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabheader.$$.fragment, local);
    			transition_in(tabcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabheader.$$.fragment, local);
    			transition_out(tabcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(tabheader);
    			destroy_component(tabcontent);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(18:1) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (17:0) <MediaQuery query="(max-width: 800px)" let:matches>
    function create_default_slot_1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[3] && create_if_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*matches*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(17:0) <MediaQuery query=\\\"(max-width: 800px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    // (34:1) {#if matches}
    function create_if_block(ctx) {
    	let div1;
    	let tabheader;
    	let t0;
    	let tabcontent;
    	let t1;
    	let div0;
    	let a0;
    	let t3;
    	let p0;
    	let t5;
    	let a1;
    	let t7;
    	let p1;
    	let t9;
    	let a2;
    	let current;

    	tabheader = new TabHeader({
    			props: { names: /*tabs*/ ctx[0].map(func_1) },
    			$$inline: true
    		});

    	tabheader.$on("select", /*handleSelect*/ ctx[2]);

    	tabcontent = new TabContent({
    			props: {
    				content: /*tabs*/ ctx[0][/*selectedIndex*/ ctx[1]].content
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(tabheader.$$.fragment);
    			t0 = space();
    			create_component(tabcontent.$$.fragment);
    			t1 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "email";
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "·";
    			t5 = space();
    			a1 = element("a");
    			a1.textContent = "github";
    			t7 = space();
    			p1 = element("p");
    			p1.textContent = "·";
    			t9 = space();
    			a2 = element("a");
    			a2.textContent = "linkedin";
    			attr_dev(a0, "href", "mailto:vivekshrikhande444@gmail.com");
    			attr_dev(a0, "rel", "noopener");
    			attr_dev(a0, "class", "svelte-17wp3ml");
    			add_location(a0, file, 38, 3, 1186);
    			attr_dev(p0, "class", "svelte-17wp3ml");
    			add_location(p0, file, 39, 3, 1260);
    			attr_dev(a1, "href", "https://github.com/vivek-shrikhande");
    			attr_dev(a1, "rel", "noopener");
    			attr_dev(a1, "class", "svelte-17wp3ml");
    			add_location(a1, file, 40, 3, 1279);
    			attr_dev(p1, "class", "svelte-17wp3ml");
    			add_location(p1, file, 41, 3, 1354);
    			attr_dev(a2, "href", "https://www.linkedin.com/in/vivek-shrikhande");
    			attr_dev(a2, "rel", "noopener");
    			attr_dev(a2, "class", "svelte-17wp3ml");
    			add_location(a2, file, 42, 3, 1374);
    			attr_dev(div0, "class", "links svelte-17wp3ml");
    			add_location(div0, file, 37, 2, 1163);
    			attr_dev(div1, "class", "tab-layout-large-screen svelte-17wp3ml");
    			add_location(div1, file, 34, 1, 987);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(tabheader, div1, null);
    			append_dev(div1, t0);
    			mount_component(tabcontent, div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div0, t5);
    			append_dev(div0, a1);
    			append_dev(div0, t7);
    			append_dev(div0, p1);
    			append_dev(div0, t9);
    			append_dev(div0, a2);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const tabheader_changes = {};
    			if (dirty & /*tabs*/ 1) tabheader_changes.names = /*tabs*/ ctx[0].map(func_1);
    			tabheader.$set(tabheader_changes);
    			const tabcontent_changes = {};
    			if (dirty & /*tabs, selectedIndex*/ 3) tabcontent_changes.content = /*tabs*/ ctx[0][/*selectedIndex*/ ctx[1]].content;
    			tabcontent.$set(tabcontent_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tabheader.$$.fragment, local);
    			transition_in(tabcontent.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tabheader.$$.fragment, local);
    			transition_out(tabcontent.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(tabheader);
    			destroy_component(tabcontent);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(34:1) {#if matches}",
    		ctx
    	});

    	return block;
    }

    // (33:0) <MediaQuery query="(min-width: 801px)" let:matches>
    function create_default_slot(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*matches*/ ctx[3] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*matches*/ ctx[3]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*matches*/ 8) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(33:0) <MediaQuery query=\\\"(min-width: 801px)\\\" let:matches>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let mediaquery0;
    	let t;
    	let mediaquery1;
    	let current;

    	mediaquery0 = new MediaQuery({
    			props: {
    				query: "(max-width: 800px)",
    				$$slots: {
    					default: [
    						create_default_slot_1,
    						({ matches }) => ({ 3: matches }),
    						({ matches }) => matches ? 8 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	mediaquery1 = new MediaQuery({
    			props: {
    				query: "(min-width: 801px)",
    				$$slots: {
    					default: [
    						create_default_slot,
    						({ matches }) => ({ 3: matches }),
    						({ matches }) => matches ? 8 : 0
    					]
    				},
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(mediaquery0.$$.fragment);
    			t = space();
    			create_component(mediaquery1.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(mediaquery0, target, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(mediaquery1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mediaquery0_changes = {};

    			if (dirty & /*$$scope, tabs, selectedIndex, matches*/ 27) {
    				mediaquery0_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery0.$set(mediaquery0_changes);
    			const mediaquery1_changes = {};

    			if (dirty & /*$$scope, tabs, selectedIndex, matches*/ 27) {
    				mediaquery1_changes.$$scope = { dirty, ctx };
    			}

    			mediaquery1.$set(mediaquery1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(mediaquery0.$$.fragment, local);
    			transition_in(mediaquery1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(mediaquery0.$$.fragment, local);
    			transition_out(mediaquery1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(mediaquery0, detaching);
    			if (detaching) detach_dev(t);
    			destroy_component(mediaquery1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const func = elem => elem.name;
    const func_1 = elem => elem.name;

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TabLayout', slots, []);
    	let { tabs = [{ name: "tab_name", content: "tab_content" }] } = $$props;
    	let selectedIndex = 0;

    	function handleSelect(event) {
    		$$invalidate(1, selectedIndex = event.detail.selectedIndex);
    	}

    	const writable_props = ['tabs'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<TabLayout> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('tabs' in $$props) $$invalidate(0, tabs = $$props.tabs);
    	};

    	$$self.$capture_state = () => ({
    		MediaQuery,
    		TabHeader,
    		TabContent,
    		tabs,
    		selectedIndex,
    		handleSelect
    	});

    	$$self.$inject_state = $$props => {
    		if ('tabs' in $$props) $$invalidate(0, tabs = $$props.tabs);
    		if ('selectedIndex' in $$props) $$invalidate(1, selectedIndex = $$props.selectedIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [tabs, selectedIndex, handleSelect];
    }

    class TabLayout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { tabs: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TabLayout",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get tabs() {
    		throw new Error("<TabLayout>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set tabs(value) {
    		throw new Error("<TabLayout>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    let tabContent = [
        {
            name: "about",
            content: `
        <p>
        Hi,
        </p> 
        
        <p>
        My name is Vivek Shrikhande. I am an experienced Software Engineer based
        in Bengaluru, India. I am mainly focused on backend development but also
        have working experience in building UI.
        </p>
        
        <p>
        During my last role at Maplelabs, I led a small team of 3 for developing
        a microservices based application.
        </p>

        <p>
        I do open source development in my free time. I have authored few open
        source projects (see projects section) and recently have
        also contributed to
        <a href="https://github.com/vivek-shrikhande/tern/commit/95ae93cdc9416fed15ca0b102df3709f99041383">
        tern</a>
        SQL migrator written in Go.
        </p>

        Some of the technologies I am familiar with,</br>
        <h4>&nbsp; # Languages</h4>
        &nbsp; - Go, Python</br>
        &nbsp; - Java, Javascript (prior experience)

        <h4>&nbsp; # Frontend (working experience)</h4>
        &nbsp; - HTML, CSS, Angular, Svelte 

        <h4>&nbsp; # Platforms and tools</h4>
        &nbsp; - Linux, Docker, Kubernetes</br>
        &nbsp; - Git, Makefile</br>

        <h4>&nbsp; # Databases, Message queue and others</h4>
        &nbsp; - ELK Stack, Kafka, Redis, MongoDB, PostgreSQL, BigQuery, Snowflake</br>
        </br>
        
        <p>
        Besides programming, I play PUBG (online multiplayer game), watch Cricket and few other sports.
        </p>

        <p>
        Currently I am on vacation and open to opportunities.
        </p>

        <p>
        If you are interested in having me in your project, please contact me by email.
        </p>        
        `
        },
        {
            name: "projects",
            content: `
        <p>
            I do open source development in my free time. I have authored a few open
            source projects as listed below,
        </p>

        <dl class="last-elem">
            
            <dt><a href="https://github.com/vivek-shrikhande/json-flat"><h3>- json-flat</h3></a></dt>
            <dd>A Python library to flatten a nested json. Nested json is common in documents stores like
            MongoDB, elasticsearch etc. Since it's nested, it can't be directly shown in a tabular format
            (for example in UI) or exported to a CSV. json-flat can help convert such json into a
            flatter one. Try it out <a href="https://vivek-shrikhande.github.io/json-to-csv-web-app">online</a>.
            </dd>

            <dt><a href="https://vivek-shrikhande.github.io/json-to-csv-web-app"><h3>- json-to-csv-web-app</h3></a></dt>
            <dd>A simple website for flattening/converting json to csv. Uses the above library for the actual flattening.
            The backend API is served using AWS lambda.</dd>

            <dt><a href="https://vivek-shrikhande.github.io/easy-mql/#/"><h3>- easy-mql</h3></a></dt>
            <dd>
                <p class="last-elem">
                    An easy-to-use SQL like query language for MongoDB. It solves few difficulties in writing
                    bson based MongoDB queries (the official MQL). For instance, it eliminates the use of { and }
                    around all the constructs, allows the use of symbolic operators like + for addition, - for
                    subtraction etc. It also ports few MongoDB syntaxes to those of SQL like CASE, EXTRACT, IF,
                    IF_NULL etc.
                </p>
            </dd>
        </dl>
        `
        },
    ];

    /* src/App.svelte generated by Svelte v3.44.0 */

    function create_fragment(ctx) {
    	let tablayout;
    	let current;

    	tablayout = new TabLayout({
    			props: { tabs: tabContent },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(tablayout.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tablayout, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tablayout.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tablayout.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tablayout, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ TabLayout, tabContent });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
