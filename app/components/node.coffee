#(c) 2014 Indexia, Inc.

`import Ember from 'ember'`

#A simple tree object structure consists of parent->child relationship.
EmNode = Ember.Object.extend
    #References for the children of current node
    children: undefined
    parent: undefined

    addChild: (node) ->
        @emptyChildren() if not @get('children')
        node.set 'parent', @
        @children.addObject node
        node

    createChild: (object) ->
        @emptyChildren() if not @get('children')
        
        c = EmNode.create(object)
        c.set 'parent', @
        @get('children').pushObject c

        c1 = EmNode.create()
        c

    removeChild: (node) ->
        node.set 'parent', undefined
        @get('children').removeObject node
        node

    hasChildren: (->
        @get('children').length > 0
    ).property('children.length')

    emptyChildren: (->
        @set 'children', Ember.A()
    )

    hasParent: (->
        #Root is not counted as a parent
        return @get('parent.parent')?
    ).property('parent')

    root: (->
        node = @
        while (node.get('hasParent'))
            return node if not node.get('hasParent')
            node = node.get('parent')
        node
    ).property('parent')

    level: (->
        i = 0;
        currObj = @
        while currObj.get('hasParent')
            i++
            currObj = currObj.get('parent')

        return i
    ).property('children.length')

    isLevel1: (->
        @get('level') is 0
    ).property('children.length')
    
    findChildBy: (key, name) ->
        findChildrenOfNodeBy @, key, name

`export default EmNode`

findChildrenOfNodeBy = (currChild, key, value) ->
        if currChild.get(key) is value
            return currChild
        else if currChild.get('children')?.length > 0
            for c in currChild.get('children')
                if c.get(key) is value
                    return c
                else
                    findChildrenOfNodeBy c, key, value
            return null
        return null
