import React from 'react';
import axios from 'axios';
import { updateModuleSetting } from '../service/dashboardService.js';
import { EmbedBuilder } from '../common/Embed';
import MessageSetting from './MessageSetting.jsx';
import ModuleSettings from '../common/ModuleSettings.jsx';
import SettingCheckbox from '../common/SettingCheckbox.jsx';
import RichSettingSelect from '../common/RichSettingSelect.jsx';
import Variables from '../common/Variables.jsx';
import Help from '../common/Help.jsx';
import WelcomeImageBuilder from './WelcomeImageBuilder.jsx';

export default class Welcome extends React.Component {
    state = {
        welcome: {},
        channels: [],
        roles: [],
        isLoading: true,
        type: 'MESSAGE',
    };

	async UNSAFE_componentWillMount() {
		try {
			let response = await axios.get(`/api/modules/${this.props.match.params.id}/welcome`);

			this.setState({
				welcome: response.data.welcome,
                channels: response.data.channels,
                roles: response.data.roles,
				isLoading: false,
			});
		} catch (e) {
			this.setState({ error: 'Failed to get data, try again later' });
		}
	}

	handleChannel = (selectedOption) => {
		let welcome = this.state.welcome;
		welcome.channel = selectedOption.value || false;
		this.setState({ welcome });
    }

    handleType = (event) => {
        const { welcome } = this.state;
        welcome.type = event.target.value;
        updateModuleSetting(this.props.data.module, 'type', event.target.value, 'type');
        this.setState({ welcome });
    }

    toggleDM = (props, isEnabled) => {
        const { welcome } = this.state;
        welcome.sendDM = !!isEnabled;
        this.setState({ welcome });
    }

    saveEmbed = async (embed) => {
		let { welcome } = this.state;
		welcome.embed = embed;
		try {
            updateModuleSetting(this.props.data.module, 'embed', embed, 'embed');
			await this.setState({ welcome });
		} catch (err) {
			return _showError(err);
		}
    }
    
    saveImage = async (image) => {
		let { welcome } = this.state;
		welcome.image = image;
		try {
            updateModuleSetting(this.props.data.module, 'image', image, 'image');
			await this.setState({ welcome });
		} catch (err) {
            console.log(err);
			return _showError(err);
		}
    }

    render() {
		const module = this.props.data.module;
		const welcome = this.state.welcome;
        const channels = this.state.channels.filter(c => c.type === 0);
        const roles = this.state.roles;

		const channelOptions = channels.map(c => ({ value: c.id, label: c.name }));
		const defaultChannel = channels.find(c => c.id === welcome.channel);

		return (<ModuleSettings {...this.props} name='welcome' title='Welcome' isLoading={this.state.isLoading}>
            <div className='settings-panel'>
                <div className='settings-group'>
                    <div className='settings-content is-half'>
                        <p className='control' style={{display: 'flex', alignItems: 'center'}}>
                            <input id='messageType' className='radio'
                                type='radio'
                                name='type'
                                value='MESSAGE'
                                onChange={this.handleType}
                                checked={welcome.type === 'MESSAGE'} />
                            <label htmlFor='messageType'>
                                Message
                            </label>
                            <Help text='Welcomes the user with a message.' />
                            <input id='embedType' className='radio'
                                type='radio'
                                name='type'
                                value='EMBED'
                                onChange={this.handleType}
                                checked={welcome.type === 'EMBED'} />
                            <label htmlFor='embedType'>
                                Embed
                            </label>
                            <Help text='Welcomes the user with an embed.' />
                            {/* <input id='imageType' className='radio'
                                type='radio'
                                name='type'
                                value='IMAGE'
                                onChange={this.handleType}
                                checked={welcome.type === 'IMAGE'} />
                            <label htmlFor='imageType'>
                                Image
                            </label>
                            <Help text='Welcomes the user with an image.' /> */}
                        </p>
                    </div>

                    <div className='settings-content is-half'>
                        <SettingCheckbox
                            module={module}
                            setting='sendDM'
                            friendlyName='DM Welcome Message'
                            defaultValue={welcome.sendDM || false}
                            onChange={this.toggleDM}
                            text='Send Welcome Message in a DM (Private Message)' />
                    </div>
                </div>

                <div className='settings-content'>
                    {!welcome.sendDM && (
                        <RichSettingSelect
                            module={module}
                            setting='channel'
                            friendlyName='Welcome Channel'
                            text='Welcome Channel'
                            defaultValue={defaultChannel}
                            defaultOption='Select Channel'
                            options={channelOptions}
                            onChange={this.handleChannel} />
                    )}
                    {welcome.type === 'MESSAGE' && (
                        <MessageSetting
                            module={module}
                            setting='message'
                            friendlyName='Message'
                            text='Message'
                            defaultValue={welcome.message}
                            placeholder='Welcome to the server, {user}!' />
                    )}
                    {welcome.type === 'EMBED' && (
                        <EmbedBuilder
                            roles={roles}
                            channels={channels}
                            embed={welcome.embed ? welcome.embed : false}
                            isPremium={this.props.data.isPremium}
                            cancelButton={false}
                            onSave={this.saveEmbed}
                            saveText='Save'
                            cloneButton={false} />
                    )}
                </div>
                {welcome.type === 'IMAGE' && (
                    <WelcomeImageBuilder 
                    image={welcome.image || {}}
                    save={this.saveImage} />
                )}
                <div className='settings-content'>
                    <h3 className='title is-5'>Variables</h3>
                    <p>You can use these variables in the message boxes above.</p>
                    <Variables />
                </div>
            </div>
		</ModuleSettings>);
    }
}
