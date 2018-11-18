# Generated by Django 2.1.2 on 2018-11-18 00:44

from django.db import migrations, models
import django.db.models.deletion
import economy.models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboard', '0110_auto_20181027_1727'),
        ('kudos', '0003_auto_20181028_2051'),
    ]

    operations = [
        migrations.CreateModel(
            name='BulkTransferCoupon',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_on', models.DateTimeField(db_index=True, default=economy.models.get_time)),
                ('modified_on', models.DateTimeField(default=economy.models.get_time)),
                ('num_uses_total', models.IntegerField()),
                ('num_uses_remaining', models.IntegerField()),
                ('current_uses', models.IntegerField(default=0)),
                ('secret', models.CharField(max_length=255, unique=True)),
                ('token', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bulk_transfers', to='kudos.Token')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='BulkTransferRedemption',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_on', models.DateTimeField(db_index=True, default=economy.models.get_time)),
                ('modified_on', models.DateTimeField(default=economy.models.get_time)),
                ('ip_address', models.GenericIPAddressField(default=None, null=True)),
                ('coupon', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bulk_transfer_redemptions', to='kudos.BulkTransferCoupon')),
                ('kudostransfer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bulk_transfer_redemptions', to='kudos.KudosTransfer')),
                ('redeemed_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bulk_transfer_redemptions', to='dashboard.Profile')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
