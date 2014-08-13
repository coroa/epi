#(c) 2014 Indexia, Inc.
# adapted by removing all WithConfigMixin by coroa

`import Ember from 'ember'`


###*
# A tree component
#
# @class Tree
###
Tree = Ember.Component.extend
    tagName: 'ul'
    layoutName: 'em-tree'
    classNameBindings: ['styleClasses']
    styleClasses: ['em-tree-branch', 'em-tree', 'fa-ul'].join " "

    ###*
    # The model to render as the root node of the tree
    # this property is expected to be defined by the user
    ###
    model: undefined

    itemController: null,

    'in-multi-selection': false

    'multi-selection': Ember.A()

    'expand-depth': null

    expandByDepth: (->
        if @get('expand-depth')
            depth = parseInt @get('expand-depth')
            return if depth is 0
            expandTree @get('model'), depth
            @set('expand-depth', null)
    ).observes('expand-depth', 'model').on('didInsertElement'),

`export default Tree`


expandTree = (node, depth) ->
    return if depth is 0

    children = node.get('children')
    if children and "function" is typeof children.then
        children.then((loadedChildren) ->
            Ember.run.schedule "render", node, 'set', 'expanded', true
            loadedChildren.forEach((c) ->
                expandTree c, depth-1
            )
        )
    else
        node.set 'expanded', true
        return if children.get('length') is 0 or depth is 0
        for c in children
            expandTree c, depth-1
