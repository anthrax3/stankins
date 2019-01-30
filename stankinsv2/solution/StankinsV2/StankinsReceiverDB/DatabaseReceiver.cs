﻿using Stankins.Interfaces;
using StankinsCommon;
using StankinsObjects;
using System;
using System.Data;
using System.Data.Common;
using System.Threading.Tasks;

namespace StankinsReceiverDB
{
    public abstract class DatabaseReceiver: BaseObject, IReceive
    {
        protected readonly string connectionString;
        protected string connectionType;

        
        public DatabaseReceiver(CtorDictionary dict) : base(dict)
        {
            connectionString = GetMyDataOrThrow<string>(nameof(connectionString));
            connectionType = GetMyDataOrThrow<string>(nameof(connectionType));
        }
        public DatabaseReceiver(string connectionString, string connectionType) : this(new CtorDictionary()
        {
            {nameof(connectionString),connectionString },
            {nameof(connectionType),connectionType }
        })
        {

        }
        protected virtual DbConnection NewConnection()
        {
            var t = Type.GetType(connectionType);
            return Activator.CreateInstance(t) as DbConnection;
        }
        protected async Task<DataTable> FromSql(string stmtSql)
        {
            using (var cn = NewConnection())
            {
                cn.ConnectionString = connectionString;
                await cn.OpenAsync();
                using (var cmd = cn.CreateCommand())
                {
                    cmd.CommandText = stmtSql;
                    cmd.CommandType = CommandType.Text;
                    using (var ir = await cmd.ExecuteReaderAsync())
                    {
                        var dt = new DataTable();
                        dt.Load(ir);
                        return dt;


                    }
                }
            }
        }
    }
}
