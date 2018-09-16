﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace StankinsV2Interfaces
{
    public interface IStreaming<T>        
    {
        Task<bool> Initialize();
        IEnumerable<T> StreamTo(IDataToSent dataToSent);
    }
}