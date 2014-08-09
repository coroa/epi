#(c) 2014 Indexia, Inc.
# adapted by removing all WithConfigMixin by coroa

`import Ember from 'ember';`


###*
# A branch of a tree.
#
# @class TreeBranch
###
TreeBranch = Ember.Component.extend
    ###*
    # The model to render its children within this branch
    # this property is set during component markup creation
    ###
    model: undefined

    ###*
    # A list of {{#crossLink "TreeNode"}}nodes{{/crossLink}} instances.
    ###
    children: Ember.computed.alias 'model.children'

    itemController: null,

    tagName: 'ul'
    layoutName: 'em-tree-branch'
    classNameBindings: ['styleClasses']

    styleClasses: ['em-tree-branch', 'fa-ul'].join " "

`export default TreeBranch;`
