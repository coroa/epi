#(c) 2014 Indexia, Inc.
# adapted by removing all WithConfigMixin by coroa

`import Ember from 'ember';`

###*
# A node of a tree.
#
# @class TreeNode
###
TreeNode = Ember.Component.extend
    attributeBindings: ['multi-selected']

    ###*
    # The model the tree node view is bound to
    ###
    model: undefined

    ###*
    # A reference to the tree view, this property is auto set during component instantiation
    ###
    tree: undefined

    ###*
    # A reference to the root model
    ###
    rootModel: Ember.computed.alias 'tree.model'

    ###*
    # True if the node is currently expanded, meaning its children are visible.
    ###
    expanded: Ember.computed.alias 'model.expanded'

    ###*
    # True if this node view is currently checked
    # This is only relevant if the tree configured to support multi selection
    ###
    'multi-selected': Ember.computed.alias 'model.selected'

    ###*
    # True if should render an icon tag for this node view
    ###
    hasIcon: true

    ###*
    # True if this node can be single selected
    ###
    selectable: true

    ###*
    # True if this node is currently single selected
    ###
    isSelected: (->
        @get('tree.selected') is @get('model')
    ).property('tree.selected')

    ###*
    # True if this node is currently loading,
    # Usually that means the node is defined asynchronously and its children are currently being loaded
    ###
    loading: Ember.computed.alias 'model.children.isPending'

    #The branch of this node
    branch: Ember.computed.alias 'parentView'

    itemController: null,

    ###*
    # true if this is a leaf node, meaning it has no children
    ###
    leaf: (->
        not @get('model.children') or @get('model.children.length') is 0
    ).property('model.children.length')

    tagName: 'li'
    layoutName: 'em-tree-node'
    classNameBindings: ['styleClasses', 'expandedClasses', 'leafClasses']

    styleClasses: 'em-tree-node'

    expandedClasses: (->
        (if @get('expanded') then [] else []).join " "
    ).property('expanded', 'leaf', 'loading')

    nodeSelectedClasses: (->
        if @get('isSelected') then 'em-tree-node-active' else null
    ).property('isSelected')

    addMultiSelectionToTreeSelection: (->
        if @get('multi-selected')
            @get('tree.multi-selection').pushObject @get('model')
        else
            @get('tree.multi-selection').removeObject @get('model')
    ).observes('multi-selected').on('init')

    iconClass: (->
        ['fa-li', 'fa'].concat \
            #Show loading mode
            if @get('loading')
                ['fa-spinner', 'fa-spin']
            #We don't have a children yet, that means we need to load them async, we show 'closed' icon even though there may not be
            #any childs beneath this node, we may enhance this behavior by asking the user whether the item has children beneath it
            else if not @get('model.children')
                ['fa-plus-square-o']
            #We have children loaded already
            else
                #No children for this one, then this is a leaf
                if @get('model.children.length') is 0
                    ['fa-square-o']
                else
                    #There are children
                    if @get('expanded')
                        ['fa-minus-square-o']
                    else
                        ['fa-plus-square-o']
            .join " "
    ).property('expanded', 'leaf', 'loading')

    leafClasses: (->
        if @get('leaf')
            'leaf'
    ).property('leaf')

    actions:
        toggle: ->
            @toggleProperty 'expanded'

        select: ->
            return if not @get('selectable')
            @set 'tree.selected', @get('model')

        toggleSelection: ->
            if @get('multi-selected') then @set('multi-selected', '') else @set('multi-selected', 'true')

    children: 'getChildren'

    # loadingHasChanged: (->
    #     if not @get('loading')
    #         @toggleProperty 'expanded'
    # ).observes('loading')
`export default TreeNode;`
