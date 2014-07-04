import UnboundSelectComponent from './unbound-select';
import AffectingMixin from '../mixins/affecting';

export default UnboundSelectComponent.extend(AffectingMixin, {
    classNames: ['form-control']
});
