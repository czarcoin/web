# Generated by Django 2.2.4 on 2021-02-02 21:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0169_auto_20210202_0726'),
    ]

    operations = [
        migrations.AddField(
            model_name='profile',
            name='is_pro',
            field=models.BooleanField(default=False, help_text='Is this user upgraded to pro?'),
        ),
        migrations.AddField(
            model_name='profile',
            name='mautic_id',
            field=models.CharField(blank=True, db_index=True, help_text='Mautic id to be able to do api requests without user being logged', max_length=128, null=True),
        ),
        migrations.AlterField(
            model_name='bountyevent',
            name='event_type',
            field=models.CharField(choices=[('accept_worker', 'Accept Worker'), ('cancel_bounty', 'Cancel Bounty'), ('submit_work', 'Submit Work'), ('stop_work', 'Stop Work'), ('stop_worker', 'Worker stopped'), ('express_interest', 'Express Interest'), ('payout_bounty', 'Payout Bounty'), ('expire_bounty', 'Expire Bounty'), ('extend_expiration', 'Extend Expiration'), ('close_bounty', 'Close Bounty'), ('worker_paid', 'Worker Paid')], max_length=50),
        ),
    ]
