import { ResponsivePie } from '@nivo/pie';
import { Box, Flex, Icon, Margins, Select, Skeleton, Table, Tile } from '@rocket.chat/fuselage';
import React, { ReactElement, useMemo } from 'react';

import { useTranslation } from '../../../../../../client/contexts/TranslationContext';
import { useEndpointData } from '../../../../../../client/hooks/useEndpointData';
import Section from '../Section';
import DownloadDataButton from '../data/DownloadDataButton';
import LegendSymbol from '../data/LegendSymbol';
import { usePeriod } from '../usePeriod';

const MessagesPerChannelSection = (): ReactElement => {
	const [period, periodSelectProps] = usePeriod();

	const t = useTranslation();

	const params = useMemo(
		() => ({
			start: period.start.toISOString(),
			end: period.end.toISOString(),
		}),
		[period],
	);

	const { value: pieData } = useEndpointData('engagement-dashboard/messages/origin', params);
	const { value: tableData } = useEndpointData(
		'engagement-dashboard/messages/top-five-popular-channels',
		params,
	);

	const [pie, table] = useMemo(() => {
		if (!pieData || !tableData) {
			return [];
		}

		const pie = pieData.origins.reduce<{ [roomType: string]: number }>(
			(obj, { messages, t }) => ({ ...obj, [t]: messages }),
			{},
		);

		const table = tableData.channels.reduce<
			{
				i: number;
				t: string;
				name?: string;
				messages: number;
			}[]
		>(
			(entries, { t, messages, name, usernames }, i) => [
				...entries,
				{ i, t, name: name || usernames?.join(' × '), messages },
			],
			[],
		);

		return [pie, table];
	}, [pieData, tableData]);

	return (
		<Section
			title={t('Where_are_the_messages_being_sent?')}
			filter={
				<>
					<Select {...periodSelectProps} />
					<DownloadDataButton
						attachmentName={`MessagesPerChannelSection_start_${params.start}_end_${params.end}`}
						headers={['Room Type', 'Messages']}
						dataAvailable={!!pieData}
						dataExtractor={() => pieData?.origins.map(({ t, messages }) => [t, messages])}
					/>
				</>
			}
		>
			<Flex.Container>
				<Margins inline='neg-x12'>
					<Box>
						<Margins inline='x12'>
							<Flex.Item grow={1} shrink={0} basis='0'>
								<Box>
									<Flex.Container alignItems='center' wrap='no-wrap'>
										{pie ? (
											<Box>
												<Flex.Item grow={1} shrink={1}>
													<Margins inline='x24'>
														<Box
															style={{
																position: 'relative',
																height: 300,
															}}
														>
															<Box
																style={{
																	position: 'absolute',
																	width: '100%',
																	height: '100%',
																}}
															>
																<ResponsivePie
																	data={[
																		{
																			id: 'd',
																			label: t('Direct_Messages'),
																			value: pie.d,
																			color: '#FFD031',
																		},
																		{
																			id: 'c',
																			label: t('Private_Channels'),
																			value: pie.c,
																			color: '#2DE0A5',
																		},
																		{
																			id: 'p',
																			label: t('Public_Channels'),
																			value: pie.p,
																			color: '#1D74F5',
																		},
																	]}
																	innerRadius={0.6}
																	colors={['#FFD031', '#2DE0A5', '#1D74F5']}
																	// @ts-ignore
																	enableRadialLabels={false}
																	enableSlicesLabels={false}
																	animate={true}
																	motionStiffness={90}
																	motionDamping={15}
																	theme={{
																		// TODO: Get it from theme
																		axis: {
																			ticks: {
																				text: {
																					fill: '#9EA2A8',
																					fontFamily:
																						'Inter, -apple-system, system-ui, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Helvetica Neue", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Meiryo UI", Arial, sans-serif',
																					fontSize: 10,
																					fontStyle: 'normal',
																					fontWeight: 600,
																					letterSpacing: '0.2px',
																					lineHeight: '12px',
																				},
																			},
																		},
																		tooltip: {
																			container: {
																				backgroundColor: '#1F2329',
																				boxShadow:
																					'0px 0px 12px rgba(47, 52, 61, 0.12), 0px 0px 2px rgba(47, 52, 61, 0.08)',
																				borderRadius: 2,
																			},
																		},
																	}}
																	// @ts-ignore
																	tooltip={({ value }): ReactElement => (
																		<Box fontScale='p2' color='alternative'>
																			{t('Value_messages', { value })}
																		</Box>
																	)}
																/>
															</Box>
														</Box>
													</Margins>
												</Flex.Item>
												<Flex.Item basis='auto'>
													<Margins block='neg-x4'>
														<Box>
															<Margins block='x4'>
																<Box color='info' fontScale='p1'>
																	<LegendSymbol color='#FFD031' />
																	{t('Private_Chats')}
																</Box>
																<Box color='info' fontScale='p1'>
																	<LegendSymbol color='#2DE0A5' />
																	{t('Private_Channels')}
																</Box>
																<Box color='info' fontScale='p1'>
																	<LegendSymbol color='#1D74F5' />
																	{t('Public_Channels')}
																</Box>
															</Margins>
														</Box>
													</Margins>
												</Flex.Item>
											</Box>
										) : (
											<Skeleton variant='rect' height={300} />
										)}
									</Flex.Container>
								</Box>
							</Flex.Item>
							<Flex.Item grow={1} shrink={0} basis='0'>
								<Box>
									<Margins blockEnd='x16'>
										{table ? (
											<Box fontScale='p1'>{t('Most_popular_channels_top_5')}</Box>
										) : (
											<Skeleton width='50%' />
										)}
									</Margins>
									{table && !table.length && (
										<Tile fontScale='p1' color='info' style={{ textAlign: 'center' }}>
											{t('Not_enough_data')}
										</Tile>
									)}
									{(!table || !!table.length) && (
										<Table>
											<Table.Head>
												<Table.Row>
													<Table.Cell>{'#'}</Table.Cell>
													<Table.Cell>{t('Channel')}</Table.Cell>
													<Table.Cell align='end'>{t('Number_of_messages')}</Table.Cell>
												</Table.Row>
											</Table.Head>
											<Table.Body>
												{table &&
													table.map(({ i, t, name, messages }) => (
														<Table.Row key={i}>
															<Table.Cell>{i + 1}.</Table.Cell>
															<Table.Cell>
																<Margins inlineEnd='x4'>
																	{(t === 'd' && <Icon name='at' />) ||
																		(t === 'c' && <Icon name='lock' />) ||
																		(t === 'p' && <Icon name='hashtag' />)}
																</Margins>
																{name}
															</Table.Cell>
															<Table.Cell align='end'>{messages}</Table.Cell>
														</Table.Row>
													))}
												{!table &&
													Array.from({ length: 5 }, (_, i) => (
														<Table.Row key={i}>
															<Table.Cell>
																<Skeleton width='100%' />
															</Table.Cell>
															<Table.Cell>
																<Skeleton width='100%' />
															</Table.Cell>
															<Table.Cell align='end'>
																<Skeleton width='100%' />
															</Table.Cell>
														</Table.Row>
													))}
											</Table.Body>
										</Table>
									)}
								</Box>
							</Flex.Item>
						</Margins>
					</Box>
				</Margins>
			</Flex.Container>
		</Section>
	);
};

export default MessagesPerChannelSection;
